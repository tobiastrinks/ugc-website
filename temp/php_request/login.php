<?php @session_start();
	
	include("../../cms/basic/php_fct.php");
	$post = html_encode($_POST);
	
	include("../dbconnect.php");
	include("../config.php");
	
	if(isset($_SESSION["reg_confirm"]) AND $_SESSION["reg_confirm"] == "login")
		$where_statement = "user_key='".$_SESSION["reg_confirm_user_key"]."'";
	else {
        $where_statement = "email='" . $post["user"] . "'";
        $name = explode(" ",$post["user"]);
        if(count($name) == 2) {
            $where_statement .=  "OR (fname='" . $name[0] . "' AND lname='". $name[1] ."')";
        }
    }
    $result = false;

	$ergebnis = $mysqli_project->query("SELECT * FROM user WHERE ".$where_statement);
	if(mysqli_num_rows($ergebnis) > 0){
		
		while($row = $ergebnis->fetch_assoc()){
			
			if($row["register_confirm"]){
				
				$password_verify = false;
				
				if(isset($_SESSION["reg_confirm"]))
					$password_verify = true;
				else if(password_verify ( $post["pw"] , $row["pw"] ))
					$password_verify = true;
				
				if($password_verify){
                    unset($_SESSION["reg_confirm"]);
                    unset($_SESSION["reg_confirm_user_key"]);

                    $_SESSION["login"] = "true";
                    $_SESSION["lc_user_key"] = $row["user_key"];

                    //Rechtezuweisung

                    if (isset($rights[$row["user_key"]]))
                        $_SESSION["user_rights"] = $rights[$row["user_key"]];
                    else
                        $_SESSION["user_rights"] = "";

                    $result = true;
                }
                else{
                    $result = false;
                }
			}
			else{
				unset( $_SESSION["login"] );
				
				$_SESSION["reg_confirm"] = "confirm";
				$_SESSION["reg_confirm_user_key"] = $row["user_key"];

                $result = true;
			}
		}
	}
	else{
        $result = false;
	}

	echo $result;
?>