const testFunc = () => {
  true ? hello() : hello();
};

const hello = () => {};

testFunc();
