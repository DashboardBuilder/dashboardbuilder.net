qb( function(){
			//window.addingTables=[];
			window.showTableList = function(show){
				if(show){
					qb('#table-selection').show(250)
					
				}
				else{
					qb('#table-selection').hide(0)

				}
				
			}
			
      
      window.bindAddTableEvts = function(){
        qb('#table-btns .ok').on('click', function(event){
            App.setAppVisibility();
          qb('#table-list .selected').each( function(i){
            //continue only if it is not added
            if(! qb(this).hasClass('added')){
              var tblName = qb.trim(qb(this).html());
              AddTable(tblName);
              qb(this).addClass('added');
            }
          })
          showTableList(false);
         })
                    
                  qb('#table-btns .cancel').on('click', function(event){
                          showTableList(false);
            
                  })
                  
                  qb('#table-list .item').on('click', function(event){
                    qb(this).toggleClass('selected');
                  })
            
                  qb('#btn-add-table').on('click', function(event){
                              schema = qb('select[name=schema]').val()
                              if(schema == ""){
                                    alert("Select a schema and then add tables")
                                    return
                              }
                              LoadTableList(schema);
                              showTableList(true);
                  
                  });
            }

            
window.removeSelection= function(tableName) {
    
    _.each(qb('#table-list .item.added').get(), 
        function(item){
         if (qb.trim(qb(item).html()) == tableName){
             qb(item).removeClass('added');
             qb(item).removeClass('selected');
             }

        });

}
		showTableList(false);
})
