import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Adjust for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Section from '../models/Section.js';

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/program_db';

async function migrate() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    // 1. Get all courses
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses to process.`);

    for (const course of courses) {
      console.log(`\nProcessing Course: ${course.title} (${course._id})`);
      
      // 2. Check if this course already has sections
      const existingSections = await Section.find({ course: course._id });
      if (existingSections.length > 0) {
        console.log(`  -> Course already has ${existingSections.length} sections. Skipping section creation.`);
      }

      // 3. Find lessons that have `course` set to this course._id
      // Since we just renamed `course` to `section` in the Schema, Mongoose strict mode might drop the `course` field when querying if we use the Lesson model directly. 
      // To get around this, we'll query the raw MongoDB collection.
      const db = mongoose.connection.db;
      const rawLessons = await db.collection('lessons').find({ course: course._id }).toArray();
      
      if (rawLessons.length === 0) {
        console.log(`  -> No legacy lessons found directly under this course.`);
        continue;
      }

      console.log(`  -> Found ${rawLessons.length} legacy lessons. Migrating...`);

      // 4. Create a default "Course Content" section for this course
      const section = new Section({
        course: course._id,
        title: 'Course Content',
        description: 'General course content migrated from legacy architecture.',
        order: 1,
        status: 'published' // assuming we publish the migrated section so it remains visible
      });
      await section.save();
      console.log(`  -> Created Section: ${section.title} (${section._id})`);

      // 5. Update the legacy lessons
      for (const lesson of rawLessons) {
        await db.collection('lessons').updateOne(
          { _id: lesson._id },
          { 
            $set: { section: section._id },
            $unset: { course: "" } 
          }
        );
      }
      console.log(`  -> Successfully migrated ${rawLessons.length} lessons to the new section.`);
    }

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

migrate();
