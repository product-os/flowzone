const { square } = require('./index');

test('squares 2 to equal 4', () => {
  expect(square(2)).toBe(4);
});
