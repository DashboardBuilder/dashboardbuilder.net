
qb(function() {
  var fillResultData;
  qb('#design-results-btns .btn').on("click", function(event) {
    var sqlOut;
    if (qb(this).hasClass('selected')) {
      return;
    } else {
      qb('#right-pane').toggleClass('design-mode results-mode');
      qb('#design-results-btns .selected').removeClass('selected');
      qb(this).addClass('selected');
    }
    if (qb('#right-pane').hasClass('results-mode')) {
      sqlOut = QueryMaint.getSQL();
      return fillResultData(sqlOut);
    }
  });
  fillResultData = function(sql) {
    return qb.ajax({
      url: "query_results.php",
      data: {
        sql: sql
      },
      cache: false
    }).done(function(html) {
      return qb('#results-pane').html(html);
    });
  };
  qb('#design-results-btns .design-mode').trigger('click');
  qb('#btn-save').on("click", function(event) {
    return QueryMaint.save();
  });
  qb('#btn-edit-sql').on("click", function(event) {
    var curMode, newSQL, sql;
    console.log('editing sql...');
    curMode = qb('#sql-out').hasClass('output-mode') ? 'output' : 'input';
    if (curMode === 'output') {
      sql = qb('#sql-text-op').text();
      qb('#sql-text-ip').html(sql);
      qb(this).html('Done editing');
    } else {
      newSQL = qb('#sql-text-ip').val();
      SQLDataRestorer.init(0, newSQL);
      qb(this).html('Edit SQL');
    }
    return qb('#sql-out').toggleClass('output-mode input-mode');
  });
  qb('select[name=schema]').on('blur', function(evt) {
    var schema;
    schema = qb(evt.target).val();
    if (qb('select[name=schema]').val() === "") return App.reset();
  });
  window.LoadTableList = function(schema) {
    if (qb.cookie('schema') === schema) return;
    qb.cookie('schema', schema);
    return qb.ajax({
      url: "qb_table_list.php",
      data: {
        schema: schema
      },
      cache: false
    }).done(function(html) {
      qb('#table-list').html(html);
      return bindAddTableEvts();
    });
  };
  qb('#pane-where textarea').on('keyup', _.debounce(function(event) {
    return SQLPaneView.render();
  }, 500));
  return window.App = {
    reset: function() {
      qb('select[name=schema]').val("");
      if (localStorage) localStorage.clear();
      this.setAppVisibility();
      return SQLPaneView.render();
    },
    setAppVisibility: function() {
      var show;
      show = qb('select[name=schema]').val() !== "";
      if (show) {
        return qb('.pane').fadeIn(500);
      } else {
        return qb('.pane').fadeOut(0);
      }
    }
  };
});
