/**
 * GCSlider
 * Version 0.1 of 10.09.2016
 *
 * Слайдер для HTML блоков
 * http://gusevcore.ru
 *
 * Список функций:
 *    init - Инициализация слайдера
 *    showSlide - Показать слайд
 *    start - Начать показ слайдов
 *    stop - Остановить показ слайдов
 *    setTimer - Установить интервал
 *    nextSlide - Следующий слайд
 *
 * Эффекты:
 *    move - смещение влево
 *
 * Конфигурация:
 *    box - DOM елемент слайдера
 *    width - ширина
 *    height - высота
 *    interval - интервал
 *    start - Начинать ли при инициализации
 *    miniSlideColor - цвет не активной ссылки слайда
 *    miniSlideActiveColor - цвет активной сслки слайда
 *    effect - эффект смены слайда
 */

var GCSlider = {
   version: '0.1',
   /**
    * Инициализация слайдера
    * @param config (Object) - Конфигурация(см. описание)
    */ 
   init: function(config) {
      config = Object.assign({}, this._config, config);  // Смержим конфигурацию по умолчанию

      // Проверим валидность конфигурации
      if (!this._isValidConfig(config)) {
         return;
      }

      this._createStructure(config);   // Создадим структуру
      this._setFunctions(config);      // Добавим вункции с слайдер

      config.box.showSlide(0);         // Установим на первый слайд

      // Если нужно стартовать сразу, то запустим
      if (config.start) {
         config.box.start();
      }

      // Объщая инициализация прошла(что бы повторно не добавлять стили)
      this._firstInit = this;
   },

   /**
    * Показать слайд
    * @param slideI (Integer) - Номер слайда(начиная с 0)
    */ 
   showSlide: function(slideI) {
      var 
         i = 0,
         self = this;

      // Выполним эффект смены
      GCSlider.effects[this._config.effect](this._config, slideI);
      // Пометим активным слайд
      if (this._slidesBox.Q('.GCSlider_active')) {
         this._slidesBox.Q('.GCSlider_active').removeClassName('GCSlider_active');
      }
      this._slides[slideI].addClassName('GCSlider_active');

      // Пометим активную ссылку слайда
      GCF.elemsCall(this._linksBox.children, function(miniSlide) {
         if (i != slideI) {
            miniSlide.style.background = self._config.miniSlideColor;
         } else {
            miniSlide.style.background = self._config.miniSlideActiveColor;
         }
         i++;
      });
   },

   /**
    * Начать показ слайдов
    */
   start: function() {
      this.stop();
      // Установим таймер
      this.setTimer(this._config.interval);
   },

   /**
    * Остановить показ слайдов
    */
   stop: function() {
      // Если есть таймер, убирем
      if (this._timer) {
         window.clearTimeout(this._timer);
      }
   },

   /**
    * Установить интервал
    * @param interval (Integer) - Интервал между ссменами слайда в миллисекундах
    */
   setTimer: function(interval) {
      this.stop();

      if (!interval || interval == 0) {
         return;
      }

      // Сохраним в конфигурацию
      this._config.interval = interval;

      // Установим таймер на показ следующего слайда
      this._timer = window.setInterval(this.nextSlide.bind(this), interval);
   },

   /**
    * Показать следующий слайд
    */
   nextSlide: function() {
      var slideI = this._slidesBox.Q('.GCSlider_active').index() + 1;

      if (slideI == this._slides.length) {
         slideI = 0;
      }

      this.showSlide(slideI);
   },

   // Список эффектов
   effects: {
      /**
       * Эффект смещения влево
       * @param config (Object) - Конфигурация
       * @param slideI (Integer) - Номер слайда
       */
      move: function(config, slideI) {
         // Сместим первый слайд, что бы нужный был на экране
         config.box._slides[0].style.marginLeft = (100 * slideI * -1) + '%';
      }
   },

   /**
    * Создадим структуру
    * @param config (Object) - Конфигурация
    */
   _createStructure: function(config) {
      config.box._config = config;                 // Сохраним конфигурацию в слайдере
      config.box._slides = config.box.children;    // Сохраним слайды

      // Если это инициализация первого слайдера, то установим стили
      if (!this._firstInit) {
         this._create_style();
      }

      this._setStyle_slider(config);               // Установим стили слайдера
      this._create_slides(config);                 // Создадим слайды
      this._create_slidesBox(config);              // Создадим элемент для слайдов
      this._transfer_slides(config);               // Перенесем слайды
      this._create_linksBox(config);               // Создадим ссылки слайдов
   },

   /**
    * Добавим вункции с слайдер
    * @param config (Object) - Конфигурация
    */
   _setFunctions: function(config) {
      config.box.showSlide = this.showSlide;
      config.box.start = this.start;
      config.box.stop = this.stop;
      config.box.setTimer = this.setTimer;
      config.box.nextSlide = this.nextSlide;
   },

   /**
    * Установим стили слайдера
    * @param config (Object) - Конфигурация
    */
   _setStyle_slider: function(config) {
      config.box.addClassName('GCSlider');
      config.box.style.width = config.width;
   },

   /**
    * Создадим слайды
    * @param config (Object) - Конфигурация
    */
   _create_slides: function(config) {
      var i = 0;

      // Переберем слайды и добавим стили
      while (config.box._slides[i]) {
         config.box._slides[i].addClassName('GCSlider_slide');
         config.box._slides[i].style.fontSize = window.getComputedStyle(config.box)['font-size'];
         i++;
      }

      // На основе стилей определим слайды
      config.box._slides = config.box.Q('.GCSlider_slide', true);
   },

   /**
    * Создадим элемент для слайдов
    * @param config (Object) - Конфигурация
    */
   _create_slidesBox: function(config) {
      config.box._slidesBox = document.createElement('div');

      config.box._slidesBox.className = 'GCSlider_slidesBox GCSlider_Effects_' + config.effect;
      config.box._slidesBox.style.width = config.width;
      config.box._slidesBox.style.height = config.height;

      config.box.appendChild(config.box._slidesBox);
   },

   /**
    * Перенесем слайды
    * @param config (Object) - Конфигурация
    */
   _transfer_slides: function(config) {
      var i = 0;

      while (config.box._slides[i]) {
         config.box._slidesBox.appendChild(config.box._slides[i]);
         i++;
      }
   },

   /**
    * Создадим ссылки слайдов
    * @param config (Object) - Конфигурация
    */
   _create_linksBox: function(config) {
      config.box._linksBox = document.createElement('div');

      config.box._linksBox.className = 'GCSlider_miniSlideBox';

      var i = 0;

      // Переберем слайды и создадим на них ссылки
      while (config.box._slides[i]) {
         this._create_miniSlide(config, config.box._slides[i]);
         i++;
      }

      config.box.appendChild(config.box._linksBox);
   },

   /**
    * Создадим ссылку на слайд
    * @param config (Object) - Конфигурация
    */
   _create_miniSlide: function(config) {
      var miniSlide = document.createElement('div');

      miniSlide.className = 'GCSlider_miniSlide';
      miniSlide.style.background = config.miniSlideColor;
      miniSlide.onclick = this._clickLick;

      config.box._linksBox.appendChild(miniSlide);

      return miniSlide;
   },

   /**
    * При клике на ссылку слайда
    */
   _clickLick: function() {
      var 
         slider = this.queryParent('.GCSlider'),
         slideI = this.index();

      slider.showSlide(slideI);
      slider.start();
   },

   /**
    * Добавляет стили в head
    */
   _create_style: function() {
      var style = document.createElement('style');

      style.type = 'text/css';
      style.innerHTML = '\
         .GCSlider > .GCSlider_slidesBox {\
            font-size: 0px;position: relative;overflow: hidden;white-space: nowrap;text-align: center;\
         }\
         .GCSlider > .GCSlider_slidesBox > .GCSlider_slide {\
            display:inline-block;vertical-align:top;width:100%;height:100%;text-align:left;\
         }\
         .GCSlider > .GCSlider_miniSlideBox {\
            white-space: nowrap;text-align: center;\
         }\
         .GCSlider > .GCSlider_miniSlideBox > .GCSlider_miniSlide {\
            display:inline-block;vertical-align:top;width:8px;height:8px;border-radius:8px;margin:4px;cursor:pointer;\
         }\
         .GCSlider > .GCSlider_slidesBox.GCSlider_Effects_move > .GCSlider_slide {\
            -moz-transition:all 0.5s ease-out;-o-transition:all 0.5s ease-out;-webkit-transition:all 0.5s ease-out;-ms-transition:all 0.5s ease-out;transition:all 0.5s ease-out;\
         }\
      ';

      GCF.Q('head').appendChild(style);
   },

   /**
    * Проверяет валидность конфигурации
    * @param config (Object) - Конфигурация
    */
   _isValidConfig: function(config) {
      var result = true;

      // Переберем объект конфигурации
      GCF.forEach(config, function(value) {
         // Нельзя null и не опеределенные переменные
         if (!value && value != 0) {
            result = false;
         }
      });

      return result;
   },

   _firstInit: false,      // Пройдена ли первая инициализация
   _config: {
      box: null,                          // DOM елемент слайдера
      width: '500px',                     // ширина
      height: 'auto',                     // высота
      interval: 3000,                     // интервал
      start: true,                        // Начинать ли при инициализации
      miniSlideColor: '#cccccc',          // цвет не активной ссылки слайда
      miniSlideActiveColor: '#313131',    // цвет активной сслки слайда
      effect: 'move'                      // эффект смены слайда
   }
};