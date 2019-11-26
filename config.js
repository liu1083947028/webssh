var config={
	port: 4028
};

config.changeConfig = function(cf){
    if(!cf){
        return;
    }
    for(let key in cf){
        this[key] = cf[key];
    }
};


module.exports.config=config;
