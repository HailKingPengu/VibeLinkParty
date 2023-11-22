

class MessageObject {
    constructor (_obj = {}) {
        this.date = new Date().getTime();
        Object.assign(this,_obj);

    }
}


module.exports = {MessageObject};