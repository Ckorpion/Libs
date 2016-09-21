<?
   /**
    * Конфигурация для GCBot
    * Version 0.2 of 19.09.2016
    */
   class Config {
      private $db_host = 'localhost';     // Хост
      private $db_user = '';              // Пользователь
      private $db_password = '';          // Пароль
      private $db_name = '';              // Название

      public $default_command = 'help';   // Комманда по умолчанию
      public $before_command = '';        // Команда вызовится до основной
      public $after_command = '';         // Команда вызовится после основной

      public $tokenTG = '';               // Токен для Telegram
      public $tokenVK = '';               // Токен для VK


      public function initDB() {
         GLOBAL $DB;

         if (!$this -> db_user) {
            return;
         }

         $this -> DB = new mysqli($this -> db_host, $this -> db_user, $this -> db_password, $this -> db_name);
         if (mysqli_connect_errno()) {
            exit();
         }
         $this -> DB -> set_charset('utf8');
      }
   }

   $Config = new Config();
?>