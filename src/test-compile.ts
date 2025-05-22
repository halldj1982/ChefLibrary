// A simple TypeScript file to test compilation
console.log('Hello, TypeScript!');

// Define a simple interface
interface User {
  name: string;
  age: number;
}

// Create a function that uses the interface
function greetUser(user: User): string {
  return `Hello, ${user.name}! You are ${user.age} years old.`;
}

// Use the function
const user: User = {
  name: 'John',
  age: 30
};

console.log(greetUser(user));