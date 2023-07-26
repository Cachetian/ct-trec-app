sap.ui.define(
  [],

  function () {
    "use strict";

    const todo = [];
    const doing = [];
    const done = [];
    const handles = {};

    return {

      emit: function (evt) {
        todo.push(evt);
        if (todo.length > 0 && doing.length === 0) {
          setTimeout(() => {
            this.notify();
          }, 200);
        }
      },

      notify: function () {
        if (todo.length > 0 && doing.length === 0) {
          for (const item of todo) {
            doing.push(item);
          }
          todo.length = 0;
          this.start();
        } else if (todo.length > 0 && doing.length > 0) {
          // already busy, good enough
        }
      },

      start: function () {
        if (doing.length > 0 && done.length < doing.length) {
          this.next();
        }
      },

      next: function () {
        const item = doing[done.length];
        this.process(item).then(() => {
          done.push(item);
        }).finally(() => {
          setTimeout(() => {
            if (doing.length > 0 && done.length < doing.length) {
              this.next();
            } else {
              this.complete();
            }
          }, 20);
        })
      },

      process: function (item) {
        return handles[item.event](item.data)
      },

      complete: function () {
        doing.length = 0;
        done.length = 0;
        if (todo.length > 0) {
          this.notify();
        } else {
          handles["complete"]();
        }
      },

      register: function (event, handler) {
        handles[event] = handler;
      }

    };
  }
);
