module.exports = function InsureUnique(model, query) {
	return function (req, res, next) {
		model.findOne(query, (err, data) => {
			if (err) {
				console.log(err);
			}
			if (data) {
				res.send(403, "记录已存在");
			} else {
				next();
			}
		});
	};
};