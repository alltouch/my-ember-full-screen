import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {
  init: function () {
    this._super(...arguments);

    let requestMethod = this.get('requestMethod');
    if (!requestMethod) {
      return;
    }
    console.log('Found method working:', requestMethod);

    this.fullScreenListener = () => Ember.run(this, 'fullScreenChange');
    document.addEventListener(this.get('event'), this.fullScreenListener);
  },

  willDestroy(){
    document.removeEventListener(this.get('event'), this.fullScreenListener);
  },

  prefix: function () {
    let requestMethod = this.get('requestMethod');
    return requestMethod.substr(0, requestMethod.length - 'requestFullScreen'.length);
  }.property('requestMethod'),

  event: function () {
    return this.get('prefix') + 'fullscreenchange';
  }.property('requestMethod'),

  requestMethod: function () {
    let documentElement = document.documentElement;
    let methods = ['requestFullScreen', 'webkitRequestFullScreen', 'mozRequestFullScreen', 'msRequestFullscreen'];

    for (var i = 0; i < methods.length; i++) {
      if(documentElement[methods[i]]){
        return methods[i];
      }
    }

  }.property(),

  cancelMethod: function(){
    let prefix = this.get('prefix');
    if(!prefix){
      return 'cancelFullScreen';
    }
    if(prefix === 'ms'){
      return 'msExitFullscreen';
    }
    return prefix + 'CancelFullScreen';
  }.property('prefix'),

  elementProperty: function () {
    let prefix = this.get('prefix');
    if(!prefix){
      return 'fullScreenElement';
    }
    if(prefix === 'moz'){
      return 'mozFullScreenElement';
    }
    return prefix + 'FullscreenElement';
  }.property('prefix'),

  isOpened: false,

  fullScreenChange(){
    let fullScreenElement = document[this.get('elementProperty')];
    if (fullScreenElement) {
      this.set('isOpened', true);
      this.trigger('enter', fullScreenElement);
    } else {
      this.set('isOpened', false);
      this.trigger('exit');
    }
  },

  enter(element){
    if(this.get('isOpened')){
      return;
    }
    element = element[0] || element;
    element[this.get('requestMethod')]();
  },

  exit(){
    document[this.get('cancelMethod')]();
  }

});
