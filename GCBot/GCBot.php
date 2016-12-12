<?
   /**
    * GCBot
    * Version 0.21 of 11.12.2016
    *
    * Сервер бота для Telegram
    * http://gusevcore.ru
    *
    * Список публичных функций:
    *    lang - Получить фразу
    *    sendTG - Отправить сообщение в Telegram
    *    sendVK - Отправить сообщение в VK
    */
   header('Content-type: text/html; charset=UTF-8');

   class GCBot {
      public $version = '0.21';
      public $versionDate = '11.12.2016';

      public $user = null;

      /**
       * Основная функция
       * @param user (Array) - Информация о пользователе
       * @param text (String) - Текст сообщения
       */
      public function start($user, $text) {
         GLOBAL $Commands, $Config;

         $this -> user = $user;

         // Получим команду по тексту
         $cmd_name = $this -> getCommand($text);

         // Вызовим функцию до основной
         if ($Config -> before_command) {
            $before_command = $Config -> before_command;
            $cmd_name = $Commands -> $before_command($cmd_name);
         }

         // Вызовим основную функцию
         if ($cmd_name) {
            $Commands -> $cmd_name($text);
         }

         // Вызовим функцию после основной
         if ($Config -> after_command) {
            $after_command = $Config -> after_command;
            $Commands -> $after_command($cmd_name);
         }
      }

      /**
       * Получить команду по тексту
       * @param text (String) - Текст сообщения
       */
      private function getCommand($text) {
         GLOBAL $Commands, $Config;

         // Установим команду по умолчанию
         $cmd_name = $Config -> default_command;
         $cmd_nameByText = '';

         // Переберем массив с коммандами, найдем нужную
         foreach ($Commands -> commands as $functionName => $commandVariants) {
            if (count($commandVariants)) {
               foreach ($commandVariants as $command) {
                  $command = str_replace('/','\/', $command);
                  if(preg_match('/^' . $command . '.*$/i', $text)) {
                     $cmd_nameByText = $functionName;
                  }
               }
            }
         }

         if ($cmd_nameByText != '') {
            $cmd_name = $cmd_nameByText;
         }

         return $cmd_name;
      }

      /**
       * Получить фразу
       * @param name (String) - Идентификатор фразы
       * @param bySoc (Boolean) - Зависит ли фраза от сети
       */
      public function lang($name, $bySoc = false) {
         GLOBAL $Lang;

         $text = '';
         if ($bySoc) {
            $name .= '_' . $this -> user['soc'];
         }
         if (isset($Lang -> text[$name])) {
            if (isset($Lang -> text[$name][$this -> user['lang']])) {
               $text = $Lang -> text[$name][$this -> user['lang']];
            } else {
               $text = $Lang -> text[$name]['en'];
            }
         }

         return preg_replace('/(^|\n)\s+/', '$1', $text);
      }

      /**
       * Проверка безопасности GCBot
       */
      public function GCBot() {
         GLOBAL $key;

         if (!isset($_REQUEST)) { 
            exit(); 
         } 

         if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] != 'on') {
            exit();
         }

         if (!isset($_SERVER['argv']) || count($_SERVER['argv']) == 0 || $_SERVER['argv'][0] != 'key=' . $key) {
            exit();
         }

         $this -> init();
      }

      /**
       * Инициализация
       */
      private function init() {
         GLOBAL $Config, $Commands, $Lang;

         require 'config.php';
         require 'commands.php';
         require 'lang.php';

         $Config -> initDB();
      }

      /**
       * Отправить сообщение в Telegram
       * @param chat_id (Integer) - Идентификатор чата
       * @param text (String) - Текст сообщения
       */
      public function sendTG($chat_id, $text) {
         GLOBAL $Config;

         $api_url = 'https://api.telegram.org/' . $Config -> tokenTG . '/';

         $sendto = $api_url . 'sendmessage?chat_id=' . $chat_id . '&disable_web_page_preview=true&text=' . urlencode($text);
         file_get_contents($sendto);
      }

      /**
       * Отправить сообщение в VK
       * @param user_id (Integer) - Идентификатор пользователя
       * @param text (String) - Текст сообщения
       */
      public function sendVK($user_id, $text) {
         GLOBAL $Config;

         $api_url = 'https://api.vk.com/method/messages.send?';

         $sendto = $api_url . 'message=' . urlencode($text) . '&user_id=' . $user_id . '&access_token=' . $Config -> tokenVK . '&v=5.53';
         file_get_contents($sendto);
      }
   }

   $GCBot = new GCBot();
?>