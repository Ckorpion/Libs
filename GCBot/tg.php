<?
   /**
    * Порт для для GCBot Telegram
    * Version 0.1 of 11.09.2016
    */
   $key = '';

   require 'GCBot.php';

   $response = json_decode(file_get_contents('php://input'), true);

   validData($response);

   $GCBot -> start(getUserInfo($response['message']['from']), $response['message']['text']);

   function send($text) {
      GLOBAL $response, $GCBot;

      $GCBot -> sendTG($response['message']['chat']['id'], $text);
   }

   function getUserInfo($user_info) {
      return array(
         'soc' => 'tg',
         'lang' => 'en',
         'id' => $user_info['id']
      );
   }

   function validData($response) {

      if (!isset($response['update_id'])) {
         exit();
      }

      if (!isset($response['message'])) {
         exit();
      }

      if (!isset($response['message']['from']) || !isset($response['message']['from']['id'])) {
         exit();
      }
   }
?>