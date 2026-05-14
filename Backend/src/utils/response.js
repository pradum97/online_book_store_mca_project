exports.success = (res, title, message, data = {}) => {
  return res?.json({
    action: "success",
    title,
    message,
    data,
  });
};

exports.error = (res, title, message) => {
  return res?.json({
    action: "error",
    title,
    message,
    data: null,
  });
};
