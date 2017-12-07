<?php 
/*------------------------------------------------------------------------
# version 1.0 DashboardPHP 
# ------------------------------------------------------------------------
 * @author Diginix Technologies www.diginixtedh.com
 * @link http://www.dashboardbuilder.net
 * @copyright (C) 2017 Dashboardbuilder.net
 * @license: license.txt
**/

class dashboardbuilder
{
	var $type;
	var $data;
	var $title;
	var $xaxis;
	var $yaxis;
	var $xlabel;
	var $ylabel;
	var $width;
	var $height;	
	var $xaxistitle;
	var $yaxistitle;
	var $barmode;
	var $name;
	var $tracename;
	var $orientation;
	var $size;
	var $text;
	var $showgrid;
	var $showline;
	var $hole;
	var $csv;
	var $csvdata;
	var $servername;
	var $username;
	var $password;
	var $dbname;
	var $source;
	var $rdbms;
	var $mapdata=array();
	var $mapcode=array();
	var $mapcountry=array();
	var $sizeSQL=array();
	var $sizeCol=array();
	var $textSQL=array();
	var $textCol=array();
	
	public function __construct()
    {
        // Constructor's functionality here, if you have any.
    }

	public function dashboardbuilder()
		{
			$this->type = "";
			$this->width = "";
			$this->height = "";
			$this->xaxis = array();
			$this->yaxis = array();
			$this->tracename = array();
			$this->sql = array();
			$this->xlabel = "";
			$this->ylabel = "";
			$this->title = "";	
			$this->xaxistitle = "";	
			$this->yaxistitle = "";	
			$this->barmode = "";
			$this->name = "";
			$this->orientation = "";
			$this->size = array();
			$this->text = array();
			$this->showgrid="";
			$this->showline="";
			$this->hole="";
			$this->csv="";
			$this->csvdata="";
			$this->servername = "";
			$this->username = "";
			$this->password = "";
			$this->dbname = "";
			$this->source="";
			$this->rdbms="";
			$this->xaxisSQL =array();
			$this->xaxisCol =array();
			$this->yaxisSQL=array();
			$this->yaxisCol=array();
			$this->sizeSQL=array();
			$this->sizeCol=array();
			$this->textSQL=array();
			$this->textCol=array();
			
			self::__construct();
		}
		
	function result()
		{
		// setting default values
		
		ob_start();

		// Check free version
			if (($this->source=='Database')) {
				if (($this->rdbms=='sqlite') || ($this->rdbms=='mysql')) {
					// do nothing
					}
					else {

					return "<div class='alert alert-danger alert-dismissable'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> <strong>
					FREE version </strong>of Dashboard Builder doesnt support ".
					$this->rdbms.
					' Database<br/>You need to purchase a commercial version';
				} 
			}
			if (($this->type=='line') || ($this->type=='bar') || ($this->type=='')){
			// do nothing
				}
				else {
				return "<div class='alert alert-danger alert-dismissable'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> <strong>
				FREE version </strong> of Dashboard Builder doesn't support ".$this->type." Chart<br/>You need to purchase a commercial version";
			} 
			
			//////////

			// DB module
			if (($this->source=='Database')) {
			if ((!$this->dbname=='') && (isset ($this->xaxisCol))) {
			//$conn = new mysqli($this->servername,$this->username,$this->password,$this->dbname);
			$DB_TYPE = $this->rdbms; //Type of database<br>
			$DB_HOST = $this->servername; //Host name<br>
			$DB_USER = $this->username; //Host Username<br>
			$DB_PASS = $this->password; //Host Password<br>
			$DB_NAME = $this->dbname; //Database name<br><br>
			$SERVER='host=';
			$DATABASE='dbname=';
			
			if ($DB_TYPE=='sqlsrv') {
				$SERVER='Server=';
				$DATABASE='Database=';
			}

			try{
					if ($DB_TYPE=='sqlite'){
						$conn = new PDO("$DB_TYPE:$DB_NAME");
					}
					else {
						$conn = new PDO("$DB_TYPE:host=$DB_HOST; dbname=$DB_NAME;", $DB_USER, $DB_PASS);
					}
				} catch(Exception $e){
										//echo $e;
					echo '<div class="alert alert-danger alert-dismissable">
										<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
										<strong>Error! Invalid Database Connection </strong> '.$DB_TYPE.
									  '</div>';
					return;
					}

				$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
				
				//if ($this->source=='ADatabase') {
				// do this 
						$i=0;
				 		foreach($this->xaxisSQL  as $value){
								$j=0;
								try {
								$value = str_replace("^", "'", $value); 
									foreach ($conn->query($value) as $row) {
										$this->xaxis[$i][$j]= $row[$this->xaxisCol[$i]];
										$j++;
									}
								} catch (Exception $e) { echo //$e; 
								 '<div class="alert alert-danger alert-dismissable">
										<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
										<strong>Error! Invalid Database Connection </strong> '.$this->xaxisSQL[0].
									  '</div>';
								return; }
						$i++;
						}
	
						$i=0;
						foreach($this->yaxisSQL as $value){
								$j=0;
								$value = str_replace("^", "'", $value); 
								foreach ($conn->query($value) as $row) {
									$this->yaxis[$i][$j]= $row[$this->yaxisCol[$i]];
									$j++;
								}
						$i++;
						}
						
						if ($this->type=='bubble'){
							$i=0;
							foreach($this->sizeSQL as $value){
									$j=0;
									$value = str_replace("^", "'", $value); 
									foreach ($conn->query($value) as $row) {
										$this->size[$i][$j]= $row[$this->sizeCol[$i]];
										$j++;
									}
							$i++;
							}
						}//end if bubble
						
						if (($this->type=='bubble') || ($this->type=='map') || ($this->type=='heatmap')) {
							$i=0;
							foreach($this->textSQL as $value){
									$j=0;
									$value = str_replace("^", "'", $value); 
									foreach ($conn->query($value) as $row) {
										$this->text[$i][$j]= $row[$this->textCol[$i]];
										$j++;
									}
							$i++;
							}
						} //end if bubble and map

			
			} // if end
			} // end if Database
			/////		
			
		$defaultcharttitle = ucwords($this->type) . " Chart";
		if ($this->title==''){ $this->title = $defaultcharttitle ;}
		if ($this->xaxistitle==''){ $this->xaxistitle ='X-axis';}
		if ($this->yaxistitle==''){ $this->yaxistitle ='Y-axis';}
		//if ($this->width==''){ $this->width ='default';}
		//if ($this->height==''){ $this->height ='default';}
		if ($this->barmode==''){ $this->barmode = 'group';}
		if ($this->name==''){ $this->name= $this->type;}
		if ($this->hole==''){ $this->hole =0;}
		if ($this->showgrid==''){ $this->showgrid= 'true';}
		if ($this->showline==''){ $this->showline= 'true';}
		if ($this->type =='stack'){$this->type ='bar';$this->barmode = "stack";} // set value for stack
		if ($this->type =='donut'){$this->type ='pie'; $this->hole=.4;} // set value for donut
		
		//Replacing ~ with , wihin text
		if ($this->source!='Database') {
		//$this->yaxis[0] = str_replace(array("~", ), ',', $this->yaxis[0]); 
		//$this->text[0] = str_replace(array("~", ), ',', $this->text[0]); 
		//$this->xaxis[0] = str_replace(array("~", ), ',', $this->xaxis[0]);	
	
			if(!empty($this->xaxis)) {
				foreach ($this->xaxis as $i => $value){
					$this->xaxis[$i] = str_replace(array("~", ), ',', $this->xaxis[$i]);
				}
			}

			if(!empty($this->yaxis)) {
				foreach ($this->yaxis as $i => $value){
					$this->yaxis[$i] = str_replace(array("~", ), ',', $this->yaxis[$i]);
				}
			}

			if(!empty($this->text)) {
				foreach ($this->text as $i => $value){
					$this->text[$i] = str_replace(array("~", ), ',', $this->text[$i]);
				}
			}

			if(!empty($this->size)) {
				foreach ($this->size as $i => $value){
					$this->size[$i] = str_replace(array("~", ), ',', $this->size[$i]);
				}
			}
		}
		
		?>
		
  		<div id="<?php echo $this->name;?>" ><!-- chart will be drawn inside this DIV --></div>
		<script>
		  (function(){
		 window.PLOTLYENV={};

                var gd = document.getElementById('<?php echo $this->name;?>')
                var resizeDebounce = null;

                function resizePlot() {
                    var bb = gd.getBoundingClientRect();
                    Plotly.relayout(gd, {
                        width: bb.width,
                        height: bb.height
                    });
                }

                
                window.addEventListener('resize', function() {
                    if (resizeDebounce) {
                        window.clearTimeout(resizeDebounce);
                    }
                    resizeDebounce = window.setTimeout(resizePlot, 100);
                });

			
		<?php 
		
		// Chart type Line and Bar Start //
		    if ($this->type=='line' || $this->type=='bar' ) 
				{
				if (!(count($this->xaxis)==count($this->yaxis))){
				    echo '</script>';		
					trigger_error("X-axis and Y-axis data must be same", E_USER_NOTICE );
					$str = ob_get_clean();
					return $str;
					return(true);
				   }
					?>
					
					<?php
					$j=0;
					foreach ($this->xaxis as $i) {
						$j++;
						?>
						var trace<?php echo $j;?> = {
																	
						  x: <?php echo json_encode($i);?>, 
						  y: <?php echo json_encode($this->yaxis[$j-1]);?>, 
						  <?php 
						  if (!empty($this->tracename[$j-1])){echo 'name:"'.$this->tracename[$j-1].'",';}
						  ?>
						   line: {shape: 'spline'},  //{shape: 'vhv'}, {shape: 'hvh'},{shape: 'vh'},{shape: 'hv'},
						  <?php if ($this->orientation=='h'){echo "orientation: 'h',";}?>
						  	type: '<?php echo $this->type;?>'
						};
						<?php 
						}// foreach end
					?>
					var data = [<?php for ($i=1;$i<$j+1;$i++){ echo 'trace'.$i.',';}?>];
					
					var layout = {
					 title: '<?php echo $this->title ;?>',
					 images: [
						{
						  x: 1,
						  y: 0.3,
						  sizex: 1,
						  sizey: 1,
						  source: "data:image/png;base64,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",
						  xanchor: "right",
						  xref: "paper",
						  yanchor: "bottom",
						  yref: "paper"
						}
					  ],
					<?php if(!($this->height=='')){?>
					   height: <?php echo $this->height;?>,
					   <?php }
					   if (!($this->width=='')){?>
					    width: <?php echo $this->width;?>,
					   <?php }?>
					  xaxis: {
						title: '<?php echo $this->xaxistitle;?>', 
						showticklabels:true,
						showgrid: <?php echo $this->showgrid;?>, 
						showline: <?php echo $this->showline;?>
					  }, 
					  yaxis: {
						title: '<?php echo $this->yaxistitle;?>', 
						showticklabels:true,
						showgrid: <?php echo $this->showgrid;?>, 
						showline: <?php echo $this->showline;?>
					  },
					 <?php if (empty($this->tracename[0])) 
					 	echo 'showlegend:false,';
					?>
					  barmode: '<?php echo $this->barmode;?>'
					};
					
				<?php
				}
			// Chart type Line and Bar End //
			
			// Chart type Area Start //
			if ($this->type=='area') 
				{
				if (!(count($this->xaxis)==count($this->yaxis))){
					echo '</script>';
					trigger_error("X-axis and Y-axis data must be same", E_USER_NOTICE );
					$str = ob_get_clean();
					return $str;
					return(true);
				   }
					?>
					
					<?php
					$j=0;
					foreach ($this->xaxis as $i) {
						$j++;
						?>
						var trace<?php echo $j;?> = {
						  x: <?php echo json_encode($i);?>, 
						  y: <?php echo json_encode($this->yaxis[$j-1]);?>, 
						  <?php 
						  if (!empty($this->tracename[$j-1])){echo 'name:"'.$this->tracename[$j-1].'",';}
						  ?>
						  fill: 'tozeroy', 
						  line: {shape: 'spline'},  //{shape: 'vhv'}, {shape: 'hvh'},{shape: 'vh'},{shape: 'hv'},
						  <?php if ($this->orientation=='h'){echo "orientation: 'h',";}?>			      
						  type: '<?php echo $this->type;?>'
						};
						<?php 
						}
					?>
					var data = [<?php for ($i=1;$i<$j+1;$i++){ echo 'trace'.$i.',';}?>];
					
					var layout = {
					 title: '<?php echo $this->title ;?>',
					  <?php if(!($this->height=='')){?>
					   height: <?php echo $this->height;?>,
					   <?php }
					   if (!($this->width=='')){?>
					    width: <?php echo $this->width;?>,
					   <?php }?>
					  xaxis: {
						title: '<?php echo $this->xaxistitle;?>', 
						showticklabels:true,
						showgrid: <?php echo $this->showgrid;?>, 
						showline: <?php echo $this->showline;?>
					  }, 
					  yaxis: {
						title: '<?php echo $this->yaxistitle;?>', 
						showticklabels:true,
						showgrid: <?php echo $this->showgrid;?>, 
						showline: <?php echo $this->showline;?>
					  },
					 <?php if (empty($this->tracename[0])) 
					 	echo 'showlegend:false,';
					?>
					  barmode: '<?php echo $this->barmode;?>'
					};
					
				<?php
				}
			
			// Chart Type Area End
			
			// Chart Type Bubble Start
			if ($this->type=='bubble') 
				{
				
				if (!(count($this->xaxis)==count($this->yaxis))){
					echo '</script>';
					trigger_error("X-axis and Y-axis data must be same", E_USER_NOTICE );
					$str = ob_get_clean();
					return $str;
					return(true);
				   }
					?>
					
					<?php
					$j=0;
					foreach ($this->xaxis as $i) {
						$j++;
						?>
						var trace<?php echo $j;?> = {
																	
						  x: <?php echo json_encode($i);?>, 
						  y: <?php echo json_encode($this->yaxis[$j-1]);?>, 

						 <?php
						  if (!empty($this->text[$j-1])){echo 'text:'.json_encode($this->text[$j-1]).',';}
						   					 
						  if (!empty($this->tracename[$j-1])){echo 'name:"'.$this->tracename[$j-1].'",';}
						  ?>
						  line: {shape: 'spline'},  //{shape: 'vhv'}, {shape: 'hvh'},{shape: 'vh'},{shape: 'hv'},
						  <?php if ($this->orientation=='h'){echo "orientation: 'h',";}?>
						   mode: 'markers',
						   marker: {
						   size: <?php if (!empty($this->size[$j-1])){echo json_encode($this->size[$j-1]);}
						   				else {echo json_encode($i);}?>
							  }
						   };
						<?php 
						}
					?>
					var data = [<?php for ($i=1;$i<$j+1;$i++){ echo 'trace'.$i.',';}?>];
					
					var layout = {
					 title: '<?php echo $this->title ;?>',
					 <?php if(!($this->height=='')){?>
					   height: <?php echo $this->height;?>,
					   <?php }
					   if (!($this->width=='')){?>
					    width: <?php echo $this->width;?>,
					   <?php }?>
					  xaxis: {
						title: '<?php echo $this->xaxistitle;?>', 
						showticklabels:true,
						showgrid: <?php echo $this->showgrid;?>, 
						showline: <?php echo $this->showline;?>
					  }, 
					  yaxis: {
						title: '<?php echo $this->yaxistitle;?>', 
						showticklabels:true,
						showgrid: <?php echo $this->showgrid;?>, 
						showline: <?php echo $this->showline;?>
					  },
					 <?php if (empty($this->tracename[0])) 
					 	echo 'showlegend:false,';
					?>
					  barmode: '<?php echo $this->barmode;?>'
					};
					
				<?php
				}
			// Chart Type Bubble End
			
			// Chart Type Histrobgram Start
				
				if ($this->type=='histogram') 
				{
					$j=0;
					foreach ($this->xaxis as $i) {
						$j++;
						?>
						var trace<?php echo $j;?> = {
																	
						  x: <?php echo json_encode($i);?>, 
						  <?php 
						  if (!empty($this->tracename[$j-1])){echo 'name:"'.$this->tracename[$j-1].'",';}
						  ?>
						 
						   line: {shape: 'spline'},  //{shape: 'vhv'}, {shape: 'hvh'},{shape: 'vh'},{shape: 'hv'},
						  <?php if ($this->orientation=='h'){echo "orientation: 'h',";}?>

						  	type: '<?php echo $this->type;?>'
						};
						<?php 
						}
					?>
					var data = [<?php for ($i=1;$i<$j+1;$i++){ echo 'trace'.$i.',';}?>];
					
					var layout = {
					 title: '<?php echo $this->title ;?>',
					 <?php if(!($this->height=='')){?>
					   height: <?php echo $this->height;?>,
					   <?php }
					   if (!($this->width=='')){?>
					    width: <?php echo $this->width;?>,
					   <?php }?>
					  xaxis: {
						title: '<?php echo $this->xaxistitle;?>', 
						showticklabels:true,
						showgrid: <?php echo $this->showgrid;?>, 
						showline: <?php echo $this->showline;?>
					  }, 
					  yaxis: {
						title: '<?php echo $this->yaxistitle;?>', 
						showticklabels:true,
						showgrid: <?php echo $this->showgrid;?>, 
						showline: <?php echo $this->showline;?>
					  },
					<?php if (empty($this->tracename[0])) 
					 	echo 'showlegend:false,';
					?>
					  barmode: '<?php echo $this->barmode;?>'
					};
					
				<?php
				}
 
				// Pei Charts
		      if ($this->type=='pie' ) 
				{
				
				if (!(count($this->xaxis)==count($this->yaxis))){
					echo '</script>';
					trigger_error("X-axis and Y-axis data must be same", E_USER_NOTICE );
					$str = ob_get_clean();
					return $str;
					return(true);
				   }
					$j=0;
					foreach ($this->xaxis as $i) {
						$j++;
						?>
						var trace<?php echo $j;?> = {
						  values: <?php echo json_encode($i);?>, 
						  labels: <?php echo json_encode($this->yaxis[$j-1]);?>, 
						   hole: <?php echo $this->hole;?>,
						  	type: '<?php echo $this->type;?>'
						   };
						<?php 
						}
					?>
					var data = [<?php for ($i=1;$i<$j+1;$i++){ echo 'trace'.$i.',';}?>];
					
					var layout = {
					 title: '<?php echo $this->title ;?>',
					 <?php if(!($this->height=='')){?>
					   height: <?php echo $this->height;?>,
					   <?php }
					   if (!($this->width=='')){?>
					    width: <?php echo $this->width;?>,
					   <?php }?>
					  <?php if (empty($this->tracename[0])) 
					 	echo 'showlegend:false,';
					?>
					};
				<?php
				}
				
				
				// Chart Type Heatmap Start
				
				if ($this->type=='heatmap') 
				{?>
				var data = [
					{
						x: <?php echo json_encode($this->xaxis[0]);?>, 
						y: <?php echo json_encode($this->yaxis[0]);?>, 
						z: [<?php
						foreach ($this->text as $value) {
							echo json_encode($value).','; 
							}
						?>],
						type: '<?php echo $this->type;?>'
					}
					];
					
					var layout = {
					 title: '<?php echo $this->title ;?>',
					 <?php if(!($this->height=='')){?>
					   height: <?php echo $this->height;?>,
					   <?php }
					   if (!($this->width=='')){?>
					    width: <?php echo $this->width;?>,
					   <?php }?>
					  xaxis: {
						title: '<?php echo $this->xaxistitle;?>', 
						showticklabels:true,
						showgrid: <?php echo $this->showgrid;?>, 
						showline: <?php echo $this->showline;?>
					  }, 
					  yaxis: {
						title: '<?php echo $this->yaxistitle;?>', 
						showticklabels:true,
						showgrid: <?php echo $this->showgrid;?>, 
						showline: <?php echo $this->showline;?>
					  },
					<?php if (empty($this->tracename[0])) 
					 	echo 'showlegend:false,';
					?>
					  barmode: '<?php echo $this->barmode;?>'
					};
					
				<?php
				}  // Heatmanp end
				
				
				
				
				
				//////// maps ///////
				if ($this->type=='map' ) 
				{
				?>
				
			Plotly.d3.csv('', function(){
			 var data = [{
						 type: 'choropleth',
						 locations: <?php echo json_encode($this->xaxis[0]);?>,
						 z: <?php echo json_encode($this->yaxis[0]);?>,
						 text: <?php echo json_encode($this->text[0]);?>,
						 colorscale: [
								[0,'rgb(5, 10, 172)'],[0.35,'rgb(40, 60, 190)'],
								[0.5,'rgb(70, 100, 245)'], [0.6,'rgb(90, 120, 245)'],
								[0.7,'rgb(106, 137, 247)'],[1,'rgb(220, 220, 220)']],

								reversescale: true,
								marker: {
									line: {
										color: 'rgb(180,180,180)',
										width: 0.5
									}
								},
								
								
						  colorbar: {
							autotic: true,
							title: 'GDP (BILLIONS)'
						  }
					  }];
			
			console.log(data.locations);
			  var layout = {
					  title: '<?php echo $this->title;?>',
					  <?php if(!($this->height=='')){?>
					   height:<?php echo $this->height;?>,
					   <?php }
					   if (!($this->width=='')){?>
					    width:<?php echo $this->width;?>,
					   <?php }?>
					  geo:{
						showframe: false,
						showcoastlines: false,
						/*projection:{
						type: 'mercator' //'robinson' 
						} */
					  },
				  };
				  	var modeBarManage = {
					modeBarButtonsToRemove: ['sendDataToCloud'],
					displaylogo: false};
					
				    Plotly.plot(gd, data, layout, modeBarManage);
				  
			  });
			  })();

			  </script>
			<?php
			$str = ob_get_clean();
		    return $str;
				}
				?>
				///////
					var modeBarManage = {
					modeBarButtonsToRemove: ['sendDataToCloud'],
					displaylogo: false};

					Plotly.plot(gd, data, layout, modeBarManage);
					}());
					</script>
		<?php
		$str = ob_get_clean();
		return $str;
		}
}

?>