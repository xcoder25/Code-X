import { db } from '../src/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

async function run() {
  const courseId = 't8DowklaqoLh1wlTFT5m';
  const courseRef = doc(db, 'courses', courseId);

  const modules = [
    {
      id: 'mod-1',
      title: 'Module 1: Foundations of JavaScript',
      lessons: [
        {
          id: 'l-1-1',
          title: 'The JavaScript Ecosystem',
          content: `JavaScript is the language of the web. It is a high-level, interpreted scripting language that conforms to the ECMAScript specification.

**Key Features:**
- Interpreted (JIT Compilation)
- Multi-paradigm (Imperative, Functional, Object-Oriented)
- Single-threaded (Event Loop)
- Dynamic typing

**Practical:** Open your browser console (F12) and type: \`navigator.userAgent\` to see the engine information.`
        },
        {
          id: 'l-1-2',
          title: 'Variables & The Lexical Environment',
          content: `In modern JS, we use \`let\` and \`const\`. 

- \`let\`: Re-assignable, block-scoped.
- \`const\`: Non-reassignable (constant reference), block-scoped.
- \`var\`: Function-scoped (legacy - avoid!).

**Note:** Always prefer \`const\` unless you know the value must change.

**Practical:** 
1. Create a constant \`PI = 3.14159\`.
2. Create a variable \`radius = 5\`.
3. Calculate area and log it.`
        }
      ]
    },
    {
      id: 'mod-2',
      title: 'Module 2: Logic & Control Flow',
      lessons: [
        {
          id: 'l-2-1',
          title: 'Truthiness & Conditionals',
          content: `JavaScript uses falsy values: \`false\`, \`0\`, \`""\`, \`null\`, \`undefined\`, and \`NaN\`. Everything else is truthy.

\`\`\`javascript
if (userAge >= 18) {
  console.log("Access Granted");
} else {
  console.log("Access Denied");
}
\`\`\`

**Practical:** Write a conditional that checks if a string is empty or contains the word 'Code-X'.`
        },
        {
          id: 'l-2-2',
          title: 'The Loop Protocol',
          content: `Loops allow us to automate repetition. 

- \`for\` loops: When you know the count.
- \`while\` loops: When you depend on a condition.
- \`for...of\`: Perfect for iterating through arrays.

**Practical:** Use a \`for\` loop to print numbers from 1 to 20, but skip multiples of 3.`
        }
      ]
    },
    {
      id: 'mod-3',
      title: 'Module 3: Functions & Modern ES6+',
      lessons: [
        {
          id: 'l-3-1',
          title: 'Arrow Functions & Closures',
          content: `Arrow functions provide a shorter syntax and lexical 'this' binding.

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
\`\`\`

A **Closure** is a function that remembers its outer variables.

**Practical:** Write a function that returns another function to keep track of a 'counter' state.`
        },
        {
          id: 'l-3-2',
          title: 'Array Powerhouse: Map, Filter, Reduce',
          content: `Learn to process data like a pro.

- \`map\`: Transform items (\`n => n * 2\`)
- \`filter\`: Remove items (\`n => n > 10\`)
- \`reduce\`: Combine items to a single value (\`sum\`)

**Practical:** Given an array of student marks [80, 45, 90, 30], filter out failed marks (< 50) and then calculate the average of the rest.`
        }
      ]
    },
    {
        id: 'mod-4',
        title: 'Module 4: Practical DOM Interaction',
        lessons: [
          {
            id: 'l-4-1',
            title: 'Interacting with the Web',
            content: `The DOM (Document Object Model) is how JS controls HTML.

- \`document.querySelector()\`
- \`addEventListener()\`

**Practical:** Create a simple HTML button and use JS to change its text to 'Clicked!' when clicked.`
          }
        ]
      }
  ];

  try {
    await updateDoc(courseRef, {
      modules: modules,
      description: 'A deep-dive into JavaScript foundations, from variables to advanced functional programming concepts.',
      updatedAt: serverTimestamp(),
      tags: ['Javascript', 'Web Dev', 'Foundations', 'Programming']
    });
    console.log('Successfully updated JavaScript Basics course with full curriculum.');
  } catch (error) {
    console.error('Error updating course:', error);
  }
}

run();
