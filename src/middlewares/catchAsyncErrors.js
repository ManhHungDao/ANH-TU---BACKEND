// module.exports = func => (req, res, next) =>
//     Promise.resolve(func(req, res, next))
//         .catch(next);

module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
