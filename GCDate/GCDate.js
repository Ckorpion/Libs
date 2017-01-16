/**
 * GCDate - Компонент выбора даты
 * Version: 0.1 of 14.01.2017
 *
 * Для работы необходим GCF.js
 * http://gusevcore.ru
 *
 * Список функций:
 *    init - Инициализация
 *    set - Установить дату
 *    get - Получить дату
 *    getId - Получить Id
 *
 * Конфигурация:
 *    box - Dom элемент для компонента. [Обязательный]
 *    type - Тип компонента.
 *       datetime - Выбор даты и времени.
 *       date - Выбор даты
 *       time - Выбор времени
 *    date - Начальная дата.
 */
var GCDate = {
   /**
    * Инициализация
    * @param config {Object} - Конфигурация. [Обязательный]
    */
   init: function(config) {
      // Если не передан контейнер, завершим работу
      if (!config.box) {
         return;
      }
      
      // Дополним конфигурацию стандртными параметрами
      for (var key in this._defaultConfig) {
         if (!config[key]) {
            config[key] = this._defaultConfig[key];
         }
      }
      // Дадим случайный ИД
      config.box.GCDate_id = Math.random().toString(36).slice(2);
      this._createContext(config);     // Создадим контекст и модели

      this._createBox(config);         // Построем контрол
      this._createFunctions(config);   // Добавим в контейнер функкции
      GCF.context.render();            // Выполним рендер контекста
      config.box.set(config.date);     // Установим в компонент начальную дату
   },

   /**
    * Установить дату
    * @param date {Date} - Дата. [Обязательный]
    */
   set: function(date) {
      GCF.context.set('GCDate/' + this.GCDate_id + '/date', date);
   },

   /**
    * Получить дату
    * @return {Date} - Дата
    */
   get: function() {
      return GCF.context.get('GCDate/' + this.GCDate_id + '/date');
   },

   /**
    * Возвращает ид в контексте
    * @return {String} - Ид
    */
   getId: function() {
      return this.GCDate_id;
   },

   /**
    * Создает контекст и модели
    * @param config {Object} - Конфигурацию
    */
   _createContext: function(config) {
      var self = this;

      // Создадим контекст с началными параметрами
      GCF.context.set('GCDate/' + config.box.GCDate_id, {
         id: config.box.GCDate_id,     // Ид компонента
         date: null,                   // Дата
         calendar: null,               // Дата в выпадающем календаре
         calendarValue: null,          // Значение(месяц или год) в календаре
         calendarMode: null,           // Режим(список дней или месяцев) календаря
         date_str: null,               // Строка даты в компоненте
         hour_str: null,               // Строка часов в компоненте
         minute_str: null              // Строка минут в компоненте
      });
      // Модель для работы с датой
      GCF.context.addModel({
         name: 'GCDate/' + config.box.GCDate_id + '/date',
         set: function(name, value) {
            var 
               date_str = value.getDate() + ' ' + GCDate._getMonths()[value.getMonth()] + ' ' + value.getFullYear(),
               minute_str = value.getMinutes();

            // Изменим строки даты, часов и минут в компоненте
            GCF.context.set('GCDate/' + config.box.GCDate_id + '/date_str', date_str);
            GCF.context.set('GCDate/' + config.box.GCDate_id + '/hour_str', value.getHours());
            GCF.context.set('GCDate/' + config.box.GCDate_id + '/minute_str', minute_str < 10 ? '0' + minute_str : minute_str);
         },
         get: function(name, value) {
            return new Date(value);
         }
      });
      // Модель для работы с датой календаря
      GCF.context.addModel({
         name: 'GCDate/' + config.box.GCDate_id + '/calendar',
         set: function(name, value) {
            self._changeCalendarValue.bind(config.box)();
         }
      });
      // Модель для работы с режимом календаря
      GCF.context.addModel({
         name: 'GCDate/' + config.box.GCDate_id + '/calendarMode',
         set: function(name, value) {
            self._changeCalendarValue.bind(config.box)();
         }
      });
   },

   /**
    * Построение компонента
    * @param config {Object} - Конфигурация
    */
   _createBox: function(config) {
      config.box.innerHTML = '';
      config.box.className = 'GCDate';

      // Если вызывается впервые
      if (Object.keys(GCF.context.get('GCDate')).length == 1) {
         this._create_style();                              // Установим стиль
         document.addEventListener('click', this._click);   // Отслеживаем клик мыши
      }

      // Если режим дата и время или дата
      if (config.type == 'datetime' || config.type == 'date') {
         this._createDate(config);
      }
      // Если режим дата и время или время
      if (config.type == 'datetime' || config.type == 'time') {
         this._createTime(config);
      }
   },

   /**
    * Создание компонента даты
    * @param config {Object} - Конфигурация
    */
   _createDate: function(config) {
      var fieldDate = document.createElement('div');                                   // Блок с датой
      fieldDate.className = 'GCDate_date GCDate_fieldBox';
      fieldDate.appendChild(this._getNewField(config.box.GCDate_id + '/date_str'));    // Создать поле
      fieldDate.appendChild(this._getNewCalendar(config));                             // Создать календарь

      config.box.appendChild(fieldDate);
   },

   /**
    * Создание календаря
    * @param config {Object} - Конфигурация
    * @return {Element} - Календарь
    */
   _getNewCalendar: function(config) {
      var 
         calendar = document.createElement('div'),    // Календарь
         valueBox = document.createElement('div'),    // Блок со значением календаря
         backMonth = document.createElement('div'),   // Стрелка назад
         value = document.createElement('div'),       // Значение календаря(месяц, год)
         nextMonth = document.createElement('div'),   // Стрелка вперед
         weekBox = document.createElement('div'),     // Блок с неделями
         days = document.createElement('div');        // Блок с днями

      backMonth.innerHTML = '&lsaquo;';
      backMonth.className = 'GCDate_calendar_valueChange';
      backMonth.dataset.type = 'back';
      nextMonth.innerHTML = '&rsaquo;';
      nextMonth.className = 'GCDate_calendar_valueChange';
      nextMonth.dataset.type = 'next';
      value.className = 'GCDate_calendar_value';
      value.setAttribute('GCF-bind', 'GCDate/' + config.box.GCDate_id + '/calendarValue');
      value.setAttribute('GCF-bind-attr', 'innerHTML');
      valueBox.appendChild(backMonth);
      valueBox.appendChild(value);
      valueBox.appendChild(nextMonth);
      valueBox.className = 'GCDate_calendar_valueBox';

      days.className = 'GCDate_calendar_days';
      // Получим значения дней недали
      weekBox.appendChild(this._getNewItems(['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], 'GCDate_calendar_week'));
      weekBox.appendChild(days);
      weekBox.className = 'GCDate_calendar_daysBox';

      calendar.className = 'GCDate_items GCDate_calendar';
      calendar.appendChild(valueBox);
      // Получим значение месяцев
      calendar.appendChild(this._getNewItems(this._getMonths(), 'GCDate_calendar_months', 'GCDate_calendar_month'));
      calendar.appendChild(weekBox);

      return calendar;
   },

   /**
    * Создание поля времени
    * @param config {Object} - Конфигурация

    * 
    * @param config {Object} - Конфигурация
    */
   _createTime: function(config) {
      var 
         fieldHour = document.createElement('div'),      // Поле часов
         delimiter = document.createElement('div'),      // Разделитель часов
         fieldMinute = document.createElement('div'),    // Поле минут
         hours = [],
         minutes = [],
         hourItems = null,
         minuteItems = null;

      fieldHour.className = 'GCDate_hour GCDate_fieldBox';
      delimiter.className = 'GCDate_str';
      fieldMinute.className = 'GCDate_minute GCDate_fieldBox';

      // Получим минуты и часы
      for (var i = 0; i <= 59; i++) {
         minutes.push(i);
         if (i >= 0 && i <= 23) {
            hours.push(i);
         }
      }

      // Создадим поле для часов
      fieldHour.appendChild(this._getNewField(config.box.GCDate_id + '/hour_str'));
      // Получим значения часов
      fieldHour.appendChild(this._getNewItems(hours, undefined, 'GCDate_calendar_hour'));
      
      delimiter.innerHTML = ':';

      // Создадим поле для минут
      fieldMinute.appendChild(this._getNewField(config.box.GCDate_id + '/minute_str'));
      // Получим значения минут
      fieldMinute.appendChild(this._getNewItems(minutes, undefined, 'GCDate_calendar_minute'));

      // Добавим все в компонент
      config.box.appendChild(fieldHour);
      config.box.appendChild(delimiter);
      config.box.appendChild(fieldMinute);
   },

   /**
    * Создание поля
    * @param contextName {String} - Имя контекста, к которому привязать
    * @return {Element} - Поле
    */
   _getNewField: function(contextName) {
      var field = document.createElement('div');
      field.className = 'GCDate_field';
      field.setAttribute('GCF-bind', 'GCDate/' + contextName);
      field.setAttribute('GCF-bind-attr', 'innerHTML');

      return field;
   },

   /**
    * Создание значений
    * @param arr {Array} - Массив значений
    * @param className {String} - Класс для контейнера
    * @param classNameItem {String} - Класс для значений
    * @return {Element} - Елемент со значениями
    */
   _getNewItems: function(arr, className, classNameItem) {
      var 
         items = document.createElement('div'),
         item = null;

      items.className = className != undefined ? className : 'GCDate_items';

      for (var i = 0; i < arr.length; i++) {
         var item = document.createElement('div');
         item.innerHTML = arr[i];
         item.className = 'GCDate_item' + (classNameItem ? ' ' + classNameItem : '');
         items.appendChild(item);
      }

      return items;
   },

   /**
    * Добавление функций компоненту
    * @param config {Object} - Конфигурация
    */
   _createFunctions: function(config) {
      var functions = ['set', 'get', 'getId'];  // Список функций для добавления

      for (var i = 0; i < functions.length; i++) {
         config.box[functions[i]] = this[functions[i]];
      }
   },

   /**
    * Создание стилей
    */
   _create_style: function() {
      var style = document.createElement('style');

      style.type = 'text/css';
      style.innerHTML = '\
         .GCDate{font-size:14px;border:solid 1px #546e7a;display:inline-block;}\
         .GCDate_fieldBox{display:inline-block;position:relative;}\
         .GCDate_str{display:inline-block;color:#999;}\
         .GCDate_items{display:none;position:absolute;top:100%;right:-1px;height:216px;overflow-y:scroll;background:#fff;text-align:center;border:solid 1px #546e7a;border-top-width:0px;}\
         .GCDate_items>.GCDate_item{text-align:right;padding:2px 10px 2px 0px;width:20px;}\
         .GCDate_item{cursor:pointer;}\
         .GCDate_item:hover{background:#ECEFF1;border-color:#ECEFF1;}\
         .GCDate_active{display:block !important;}\
         .GCDate_field{cursor:pointer;padding:2px 5px 1px;}\
         .GCDate_field:after{content:"›";transform:rotate(90deg);display:inline-block;margin-left:5px;vertical-align:bottom;font-size:21px;line-height:21px;color:#999;}\
         .GCDate_calendar{left:0px !important;height:205px;border-radius:5px;overflow:hidden !important;width:196px;background:#fff;border-width:1px !important;top:calc(100% + 10px);text-align:left;}\
         .GCDate_calendar_months,.GCDate_calendar_daysBox{display:none;}\
         .GCDate_calendar_valueBox{background: #546E7A;color: #fff}\
         .GCDate_calendar_value{margin:0px 14px;text-align:center;padding:5px !important;width:100px;}\
         .GCDate_calendar_value,.GCDate_calendar_valueChange{display:inline-block;padding:5px 12px;cursor:pointer;}\
         .GCDate_calendar_week{background:#CFD8DC;padding: 4px 0px;color:#90A4AE;}\
         .GCDate_calendar_week .GCDate_item{background:inherit;cursor:default;width:28px;}\
         .GCDate_calendar_week .GCDate_item,.GCDate_calendar_day,.GCDate_calendar_month{display:inline-block;text-align:center;}\
         .GCDate_calendar_day,.GCDate_calendar_month{padding:3px 0px;border:solid 1px #fff;width:26px;}\
         .GCDate_item.GCDate_calendar_month{width:96px;}\
         .GCDate_calendar_day.GCDate_active{background:#ECEFF1;border-color:#CFD8DC;display:inline-block !important;}\
      ';

      GCF.Q('head').appendChild(style);
   },

   /**
    * При клике мышью
    * @param event {Event} - Событие
    */
   _click: function(event) {
      var 
         field = event.target.queryParent('.GCDate_fieldBox'), // Надем поле
         box = field ? field.queryParent('.GCDate') : null,    // Найдем компонент
         action = field ? field.Q('.GCDate_items') : null,     // Найдем список значений относящийся к полю
         items = GCF.Q('.GCDate_items.GCDate_active', true);   // Найдем все списки значений

      // Скроем все активные списки значений, не относящиеся к текущему полю
      for (var i = 0; i < items.length; i++) {
         if (items[i] != action) {
            items[i].removeClassName('GCDate_active');
         }
      }

      if (event.target.hasClassName('GCDate_field')) {
         // Если клик по полю, покажем список значений
         GCDate._showItems.bind(field)();
      } else if (event.target.hasClassName('GCDate_calendar_value')) {
         // Если клик по значению календаря
         // Изменим режим календаря на масяцы
         GCF.context.set('GCDate/' + box.GCDate_id + '/calendarMode', 'months');
      } else if (event.target.hasClassName('GCDate_calendar_month')) {
         // Если клик по мясяцу
         var 
            date = GCF.context.get('GCDate/' + box.GCDate_id + '/calendar'),  // Дата календаря
            month = GCDate._getMonths().indexOf(event.target.innerHTML);      // Выбранный месяц

         // Установим выбранный месяц
         date.setMonth(month);
         GCF.context.set('GCDate/' + box.GCDate_id + '/calendar', date);         // Сохраним дату календаря
         GCF.context.set('GCDate/' + box.GCDate_id + '/calendarMode', 'days');   // Изменим режим календаря на дни
      } else if (event.target.hasClassName('GCDate_calendar_valueChange')) {
         // Если клик по стрелкам календаря
         var 
            step = event.target.dataset.type == 'back' ? -1 : 1,              // Определим вперед или назад
            date = GCF.context.get('GCDate/' + box.GCDate_id + '/calendar');  // Дата календаря

         // Если режим календаря - месяцы, установим год, иначе установим месяц
         if (GCF.context.get('GCDate/' + box.GCDate_id + '/calendarMode') == 'months') {
            date.setFullYear(date.getFullYear() + step);
         } else {
            date.setMonth(date.getMonth() + step);
         }

         // Сохраним дату календаря
         GCF.context.set('GCDate/' + box.GCDate_id + '/calendar', date);
      } else if (event.target.hasClassName('GCDate_item')) {
         // Если клик по значению
         GCDate._select.bind(box)(event.target);   // Выберим его
         action.removeClassName('GCDate_active');  // Скроем активный список значений
      }
   },

   /**
    * Показать значения
    */
   _showItems: function() {
      // Если открывается календарь
      if (this.hasClassName('GCDate_date')) {
         var box = this.queryParent('.GCDate'); // найдем компонент

         // Установим дату календаря
         GCF.context.set('GCDate/' + box.GCDate_id + '/calendar', GCF.context.get('GCDate/' + box.GCDate_id + '/date'));
         // Установим режим календаря
         GCF.context.set('GCDate/' + box.GCDate_id + '/calendarMode', 'days');
      }

      // Сделаем список активным
      this.Q('.GCDate_items').addClassName('GCDate_active');
   },

   /**
    * Показать дни
    */
   _showDays:function() {
      var 
         toDay = new Date(),                                                  // Сегодняшная дата
         selectDay = GCF.context.get('GCDate/' + this.GCDate_id + '/date'),   // Дата компонента
         date = GCF.context.get('GCDate/' + this.GCDate_id + '/calendar'),    // Дата календаря
         daysBox = this.Q('.GCDate_calendar_daysBox'),                        // Компонент со списком дней
         days = [],
         firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay() - 1;  // День недели перого числа

      this.Q('.GCDate_calendar_months').removeClassName('GCDate_active');  // Спрячем месяцы
      daysBox.addClassName('GCDate_active');                               // Покажим дни

      // Получим дни месяца
      for (var i = 1 - firstDay; i <= (32 - new Date(date.getFullYear(), date.getMonth(), 32).getDate()); i++) {
         days.push(i < 1 ? '' : i);
      }

      // Получим значения дней
      days = GCDate._getNewItems(days, undefined, 'GCDate_calendar_day');
      // Если месяц календаря равен сегодняшнему месяцу, выделим сегодняшний день
      if (selectDay.getFullYear() == date.getFullYear() && selectDay.getMonth() == date.getMonth()) {
         days.children[selectDay.getDate() + firstDay - 1].addClassName('GCDate_active');
      }
      // Вставим дни в календарь
      daysBox.Q('.GCDate_calendar_days').innerHTML = days.innerHTML;
   },

   /**
    * Покажим месяцы
    */
   _showMonths: function() {
      this.Q('.GCDate_calendar_daysBox').removeClassName('GCDate_active'); // Скроем дни
      this.Q('.GCDate_calendar_months').addClassName('GCDate_active');     // Покажим месяцы
   },

   /**
    * Изменение значения календаря
    */
   _changeCalendarValue: function() {
      var 
         calendarValue = '',                                                           // Значение календаря
         calendarDate = GCF.context.get('GCDate/' + this.GCDate_id + '/calendar');     // Дата календаря
      
      // Если показаны дни
      if (GCF.context.get('GCDate/' + this.GCDate_id + '/calendarMode') == 'days') {
         GCDate._showDays.bind(this)();   //Покажим дни
         calendarValue = GCDate._getMonths()[calendarDate.getMonth()] + ' ' + calendarDate.getFullYear();
      } else {
         GCDate._showMonths.bind(this)(); // Покажим месяцы
         calendarValue = calendarDate.getFullYear();
      }

      // Установим значение календаря
      GCF.context.set('GCDate/' + this.GCDate_id + '/calendarValue', calendarValue);
   },

   /**
    * Выбор значения
    * @param item {Element} - Значение
    */
   _select: function(item) {
      var date = GCF.context.get('GCDate/' + this.GCDate_id + '/date'); // Дата компонента

      // Если выбран день
      if (item.hasClassName('GCDate_calendar_day')) {
         var calendar = new Date(GCF.context.get('GCDate/' + this.GCDate_id + '/calendar')); // Дата календаря

         date.setFullYear(calendar.getFullYear()); // Установим год даты компонента по году даты календаря
         date.setMonth(calendar.getMonth());       // Установим месяц даты компонента по месяцу даты календаря
         date.setDate(item.innerHTML);             // Установим выбранный день
      } else if (item.hasClassName('GCDate_calendar_hour')) {
         // Если выбран час
         date.setHours(item.innerHTML);
      } else if (item.hasClassName('GCDate_calendar_minute')) {
         // Если выбрана минута
         date.setMinutes(item.innerHTML);
      }

      // Установим дату компонента
      GCF.context.set('GCDate/' + this.GCDate_id + '/date', date);
   },

   /**
    * Возвращает список месяцев
    * @return {Array} - Масяцы
    */
   _getMonths: function() {
      return ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
   },

   /**
    * Стандартная конфигурация
    */
   _defaultConfig: {
      type: 'datetime',
      date: new Date()
   }
};