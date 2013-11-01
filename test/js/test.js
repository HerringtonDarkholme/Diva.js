var a = new Diva(document.body);
a.register('alert', function (btn, span) {
  btn.text('U r H ero!');
  span.text('I\'m a span');
});
a.register('addButton', function (btnGroup) {
 btnGroup.append('<button class="btn dv-toggle">New button</button>');
});
a.init();
