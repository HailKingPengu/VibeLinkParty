

class MessageObject {
    constructor (_obj = {}) {
        this.date = new Date().getTime();
        Object.assign(this,_obj);

    }
}

function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
  }



module.exports = {MessageObject,choose};