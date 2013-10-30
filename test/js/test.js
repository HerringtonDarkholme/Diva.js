var a = new Diva(document.body);
a.register('alert', function (btn, span) {
  btn.text('U r H ero!')
  span.text('I\'m a span')
})
a.init();
