/**
 * Created by evio on 15/7/16.
 */
var HTMLInputElementPrototype = HTMLInputElement.prototype;
var HTMLTextAreaElementPrototype = HTMLTextAreaElement.prototype;

var ObjectHTMLProperty = module.exports = {};

ObjectHTMLProperty.Setters = {};
ObjectHTMLProperty.Getters = {};

try {

    ObjectHTMLProperty.Setters["INPUT"] = Object.getOwnPropertyDescriptor(HTMLInputElementPrototype, "value").set;
    ObjectHTMLProperty.Setters["TEXTAREA"] = Object.getOwnPropertyDescriptor(HTMLTextAreaElementPrototype, "value").set;

    ObjectHTMLProperty.Getters["INPUT"] = Object.getOwnPropertyDescriptor(HTMLInputElementPrototype, "value").get;
    ObjectHTMLProperty.Getters["TEXTAREA"] = Object.getOwnPropertyDescriptor(HTMLTextAreaElementPrototype, "value").get;

    Object.defineProperty (HTMLInputElementPrototype, "value", {
        set: function (value) {
            var type = this.type;
            if (['text', 'password', 'tel', 'number', 'email', 'hidden'].indexOf (type) > -1) {
                ObjectHTMLProperty.Setters["INPUT"].call (this, value);
            }
            else if (['checkbox'].indexOf (type) > -1) {
                if (ObjectHTMLProperty.Getters["INPUT"].call (this) === value + '') {
                    this.checked = true;
                } else {
                    this.checked = false;
                }
            }
        },
        get: function () {
            var type = this.type;
            if (['text', 'password', 'tel', 'number', 'email', 'hidden'].indexOf (type) > -1) {
                return ObjectHTMLProperty.Getters["INPUT"].call (this);
            }
            else if (['checkbox'].indexOf (type) > -1) {
                if (this.checked) {
                    return ObjectHTMLProperty.Getters["INPUT"].call (this);
                }
            }
        },
        writable: true,
        configurable: true
    });

    Object.defineProperty (HTMLTextAreaElementPrototype, "value", {
        set: function (value) {
            ObjectHTMLProperty.Setters["TEXTAREA"].call (this, value);
        },
        get: function () {
            return ObjectHTMLProperty.Getters["TEXTAREA"].call (this);
        }
    });
}catch(e){}