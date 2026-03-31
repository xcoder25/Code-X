import { db } from '../src/lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

async function run() {
  const courseId = 't8DowklaqoLh1wlTFT5m';
  const courseTitle = 'javascript basics';

  const assignments = [
    {
      title: 'JS Basics: The Dynamic Tip Calculator',
      description: `Create a function in a Google Colab notebook that calculates a tip based on a bill amount and a percentage. 
      
**Requirements:**
- Must use an arrow function.
- Must handle edge cases (negative numbers, non-numeric inputs).
- Log the final formatted string using a Template Literal.`,
      courseId,
      courseTitle,
      dueDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days from now
      createdAt: serverTimestamp()
    }
  ];

  for (const a of assignments) {
    await addDoc(collection(db, 'assignments'), a);
  }
  
  console.log('Added assignments for JS course.');
}

run();
