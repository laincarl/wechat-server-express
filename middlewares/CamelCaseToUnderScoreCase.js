module.exports = function () {
	return function (req, res, next) {
		var oldSend = res.send;

		res.send = function(data){
			// arguments[0] (or `data`) contains the response body
			console.log(data,typeof(data));
			// data["test"]="test";
			// arguments[0] = "modified : " + arguments[0];
			// res.send=oldSend;
			oldSend.apply(res, arguments);
		};
		next();
	};
};
