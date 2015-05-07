"use strict";
// initialize Hoodie
var hoodie  = new Hoodie();

// Todos Collection/View
function Todos($element) {
  var collection = [];
  var $el = $element;

  // Remove current flashcard from database.
  $el.on('click', 'button.removecard', function() {
    hoodie.store.remove('todo', $(this).parent().data('id'));
    return false;
  });

  // Displays field for editing of selected card.
  $el.on('click', 'button.editcard', function() {
    $(this).parent().parent().find('.editing').removeClass('editing');
    $(this).parent().addClass('editing');
    var englishword = $(this).parent().find(".englishword").text();
    var spanishword = $(this).parent().find(".spanishword").text();
    $(".new-englishword").val(englishword);
    $(".new-spanishword").val(spanishword);
    return;
  });

  // Creates flashcard.
  $("#addcard").on('click', function(event) {
    var english_word = $('#englishword').val();
    var spanish_word = $('#spanishword').val();
    var showError = function(msg){
      $('#error1').html(msg).show();
      setTimeOut(function(){
        $('#error1').fadeout('fast');
      },3000);
    }
    if(!spanish_word.length){
      showError('Spanish word missing');
      return;
    }
      else if (!english_word.length){
        showError('English word missing');
        return;
      };
    hoodie.store.add('todo', {
      english: english_word,
      spanish: spanish_word,
    });
  })

  // Saves changes.
  $el.on('click', 'button.savecard', function() {
    var panel_div = $(this).parent();
    var newenglish_word = panel_div.find('.new-englishword').val();
    var newspanish_word = panel_div.find('.new-spanishword').val();
    var id = panel_div.data('id');

    var showError = function(msg, selector){
      panel_div.find(selector).html(msg);
    }
    if (!newenglish_word.length){
      showError('English word missing', ".englishworderror");
    };
    if (!newspanish_word.length){
      showError('Spanish word missing', ".spanishworderror");
    }
    if (newenglish_word.length && newspanish_word.length) {
      hoodie.store.update('todo', id,  {
        english: newenglish_word,
        spanish: newspanish_word,
      });
      $(this).parent().removeClass('editing');
    }
  });


  // Find index/position of a todo in collection.
  function getTodoItemIndexById(id) {
    for (var i = 0, len = collection.length; i < len; i++) {
      if (collection[i].id === id) {
        return i;
      }
    }
    return null;
  }

  //Displays makup of flashcards.
  function paint() {
    $el.html('');
    collection.sort(function(a, b) {
      return ( a.createdAt > b.createdAt ) ? 1 : -1;
    });
    for (var i = 0, len = collection.length; i<len; i++) {
      $el.append(
        '<div class="panel panel-default lead text-center" data-id="' + collection[i].id + '">' +
          '<hr><div class = "englishword hide-edit">' + collection[i].english + '</div>' +
          '<input type="text" class="form-control show-edit new-englishword" /><hr>' +
          '<div class = "spanishword hide-edit">' + collection[i].spanish + '</div>' +
          '<input type ="text" class="form-control show-edit new-spanishword" /><hr>' +
          '<button class="removecard hide-edit" class="btn btn-primary">Remove Card</button>' +
          '<button class="editcard hide-edit" class="btn btn-primary">Edit Card</button>' +
          '<button class="savecard show-edit" class="btn btn-primary">Save Card</button>' +
          '<div class = "englishworderror"></div>' +
          '<div class = "spanishworderror"></div>' +
        '</div>'
      );
    }
  }

  this.add = function(todo) {
    collection.push(todo);
    paint();
  };

  this.update = function(todo) {
    collection[getTodoItemIndexById(todo.id)] = todo;
    paint();
  };

  this.remove = function(todo) {
    collection.splice(getTodoItemIndexById(todo.id), 1);
    paint();
  };

  this.clear = function() {
    collection = [];
    paint();
  };
}

// Instantiate Todos collection & view.
var todos = new Todos($('#todolist'));

// initial load of all todo items from the store
hoodie.store.findAll('todo').then(function(allTodos) {
  allTodos.forEach(todos.add);
});

// when a todo changes, update the UI.
hoodie.store.on('todo:add', todos.add);
hoodie.store.on('todo:update', todos.update);
hoodie.store.on('todo:remove', todos.remove);
// clear todos when user logs out,
hoodie.account.on('signout', todos.clear);
