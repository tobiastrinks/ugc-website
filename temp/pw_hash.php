<?php
    include("dbconnect.php");
    $ergebnis = $mysqli_project->query("SELECT ID, pw FROM user");
    while($row = $ergebnis->fetch_assoc()){
        $mysqli_project->query("UPDATE user SET pw='". password_hash($row["pw"], PASSWORD_DEFAULT) ."' WHERE ID='". $row["ID"] ."'");
    }
?>