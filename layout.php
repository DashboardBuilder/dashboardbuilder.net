<script src="assets/js/dashboard.min.js"></script>
<?php 
include('top.php');
include ('left-nav.php');
include("inc/dashboard_dist.php"); 
$xml=simplexml_load_file("data/data.xml") or die("Error: Cannot create object");

// Col data
$no_col = $_REQUEST['col'];
$col = array();
$reuslt = array();
$name = array();
$height = array();

for ($j=0;$j<$no_col;$j++){
	$col = 'col'.$j;
	$data = new dashboardbuilder(); 
	
	$data->type =  $xml->$col->type; 
	$data->source =  $xml->$col->source; 
	if (empty($xml->$col->ssl)){
				$data->servername =  $xml->$col->servername;
				}
				else
				{
				$data->servername =  'https://'.$xml->$col->servername;
			}

	$data->username =  $xml->$col->username;
	$data->password =  $xml->$col->password;
	$data->dbname =  $xml->$col->dbname;
	$data->rdbms =  $xml->$col->rdbms;
	
	$data->name = $xml->$col->name;
	$data->title = $xml->$col->title;
	$data->orientation = $xml->$col->orientation;
	$data->xaxistitle = $xml->$col->xaxistitle;
	$data->yaxistitle = $xml->$col->yaxistitle;
	$data->height = $xml->$col->height;
	$data->width = $xml->$col->width;
	$data->showgrid = $xml->$col->showgrid;
	$data->showline = $xml->$col->showline;

	
	$i=0;
	if ($xml->$col->source =="Database"){
		foreach($xml->$col->sql as $value){
		   $data->sql[$i]=  $value;
		   $i++;
		}
	}
	
	$i=0;
	foreach($xml->$col->tracename as $value){
	   $data->tracename[$i]=  $value;
	   $i++;
	}
		
	
	if (($xml->$col->source =="ADatabase")){
		$xml->$col->source = "Database";
	    if (substr($xml->$col->xaxis,0,3) =="SQL"){
			
			$i=0;
			foreach($xml->$col->xaxis as $value){
				preg_match('~{data}([^{]*){/data}~i', $value, $sqlmatch);
				preg_match('~{col}([^{]*){/col}~i', $xml->$col->xaxis[$i], $match);
				$data->xaxisSQL[$i] = $sqlmatch[1];
				$data->xaxisCol[$i] = $match[1];
				$i++;
			}

			$i=0;
			foreach($xml->$col->yaxis as $value){
				preg_match('~{data}([^{]*){/data}~i', $value, $sqlmatch);
				preg_match('~{col}([^{]*){/col}~i', $xml->$col->yaxis[$i], $match);
				$data->yaxisSQL[$i] = $sqlmatch[1];
				$data->yaxisCol[$i] = $match[1];
				$i++;
			}
	
			$i=0;
			if ($data->type=='bubble'){
				foreach($xml->$col->size as $value){
				    preg_match('~{data}([^{]*){/data}~i', $value, $sqlmatch);
					preg_match('~{col}([^{]*){/col}~i', $xml->$col->size[$i], $match);
					$data->sizeSQL[$i] = $sqlmatch[1];
					$data->sizeCol[$i] = $match[1];
					$i++;
				}
			}// end if bubble
				
			$i=0;
			if (($data->type=='bubble') || ($data->type=='map')){
				foreach($xml->$col->text as $value){
				    preg_match('~{data}([^{]*){/data}~i', $value, $sqlmatch);
					preg_match('~{col}([^{]*){/col}~i', $xml->$col->text[$i], $match);
					$data->textSQL[$i] = $sqlmatch[1];
					$data->textCol[$i] = $match[1];
					$i++;
				}
			}// end if bubble and map
			
			
		}
	}
	
	
	if (($xml->$col->source =="upload")){
		 if (substr($xml->$col->xaxis,0,3) =="XLS"){
			$i=0;
			foreach($xml->$col->xaxis as $value){
			 if ($value){
				  preg_match('~{data}([^{]*){/data}~i', $value, $match);
				  if (!empty($match[1])){
					$data->xaxis[$i] = array_map('strval', explode(',', $match[1]));
				  }
			  }
			  $i++;
			}
	
			$i=0;
			foreach($xml->$col->yaxis as $value){
			 if (!empty($value)){
				  preg_match('~{data}([^{]*){/data}~i', $value, $match);
				  if (!empty($match[1])){
					$data->yaxis[$i] = array_map('strval', explode(',', $match[1]));
				}
			  }
			  $i++;
			}
			
			if ($xml->$col->type=='bubble'){
			$i=0;
				foreach($xml->$col->size as $value){
					 if (!empty($value)){
						  preg_match('~{data}([^{]*){/data}~i', $value, $match);
						  if (!empty($match[1])){
							$data->size[$i] = array_map('strval', explode(',', $match[1]));
						}
					  }
				  $i++;
				}
			} // end if bubble
			
			if (($xml->$col->type=='bubble') || ($xml->$col->type=='map')){
				$i=0;
				foreach($xml->$col->text as $value){
					 if (!empty($value)){
						  preg_match('~{data}([^{]*){/data}~i', $value, $match);
						  if (!empty($match[1])){
							$data->text[$i] = array_map('strval', explode(',', $match[1]));
						}
					  }
				  $i++;
				}
			} // end if bubble and map
		}
	}

	$result[$j] = $data->result(); 
	$name[$j] = $data->name;
	$height[$j] = $data->height;
  
}// for end

function str_replace_first($from, $to, $subject)
{


    $from = '/'.preg_quote($from, '/').'/';

    //return preg_replace(strtoupper($from), $to, strtoupper($subject), 1);
	return preg_replace($from, $to, $subject, 1);
}
		
if ($no_col==1){
	include ('col1.php');
	}
elseif ($no_col==2){
     if ($_REQUEST['p']==2){
		include ('col2b.php');
		}
		else{
		include ('col2.php');
		}
	}
elseif ($no_col==3){
     if ($_REQUEST['p']==2){
		include ('col3b.php');
		}
		else{
		include ('col3.php');
		}
	}
elseif ($no_col==4){
		include ('col4.php');
}

include ('bottom.php');?>