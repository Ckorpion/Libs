<?
   /**
    * Комманды для GCBot
    * Version 0.1 of 11.09.2016
    */
   class Commands {
      public $commands = array(
         // Помощь
         'help'            => array('/help', 'help', 'помощь', '1')
      );

      public function help() {
         GLOBAL $GCBot;

         send($GCBot -> lang('help'));
      }
   }
   
   $Commands = new Commands();
?>