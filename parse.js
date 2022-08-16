// const port = process.env.PORT || 3000;

const testme = "A man, a plan, a canal, Panama";
const parser = /^A (\w+), a (\w+), a (\w+), (\w+)$/;
// The following version is the equivalent of above - notice how the backslashes need to be doubled
// const parser = new RegExp('^A (\\w+), a (\\w+), a (\\w+), (\\w+)$');
// const parser = new RegExp("\w+\s", 'g');

console.log("string is: " + testme);

const matched = parser.exec(testme);
// console.log(matched);
if (!matched) {
  console.log("parser did not match");
} else {
  console.log(`1: ${matched[1]}, 2: ${matched[2]}, 3: ${matched[3]}, place: ${matched[4]}`);
}
