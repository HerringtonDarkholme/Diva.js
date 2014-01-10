console.log('\'Allo \'Allo!');

var a = new Diva(document.body);
a.register('show', function (link, p) {
  p.text(link.text());
});
a.register('addButton', function (btnGroup) {
 btnGroup.append('<button class="btn dv-toggle">New button</button>');
});
a.init();
