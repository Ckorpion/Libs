<?
   /**
    * Порт для для GCBot VK
    * Version 0.1 of 11.09.2016
    */
   $key = '';
   $confirmation_token = '';

   require 'GCBot.php';

   $response = json_decode(file_get_contents('php://input'), true);

   validData($response);

   $GCBot -> start(getUserInfo($response['object']['user_id']), $response['object']['body']);
   
   function send($text) {
      GLOBAL $response, $GCBot;

      $GCBot -> sendVK($response['object']['user_id'], $text);

      echo 'ok';
   }

   function getUserInfo($user_id) {
      return array(
         'soc' => 'vk',
         'lang' => 'ru',
         'id' => $user_id
      );
   }

   function validData($response) {
      GLOBAL $confirmation_token;

      if (!isset($response['type'])) {
         exit();
      }

      if ($response['type'] == 'confirmation') {
         echo $confirmation_token;
         exit();
      }

      if (!isset($response['object'])) {
         exit();
      }

      if (!isset($response['object']['user_id'])) {
         exit();
      }

      if ($response['type'] != 'message_new') {
         exit();
      }
   }
?> 
