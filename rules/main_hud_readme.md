# Main HUD Transfer

Автономный пакет UI из главного экрана:

- кнопка `Back`
- кнопка `Restart`
- панель уровня `LEVEL N`

## Что внутри

- `main-hud.js` - компонент и API
- `main-hud.css` - стили (с адаптацией под мобильные экраны)
- `assets/` - изображения кнопок (`back_button.png`, `restart_button.png`)
- `demo.html` - пример запуска

## Быстрое подключение

1. Скопируйте папку `MainHudTransfer` в новый проект.
2. Подключите скрипт (CSS подключится автоматически):

```html
<script src="./MainHudTransfer/main-hud.js"></script>
```

3. Создайте HUD:

```html
<script>
  var hud = new MainHud({
    level: 1,
    assetBasePath: './MainHudTransfer/assets',
    onBack: function() {
      console.log('Back click');
    },
    onRestart: function() {
      console.log('Restart click');
    }
  });

  // обновить уровень
  hud.setLevel(8);
</script>
```

## API

- `setLevel(number)` - обновляет номер уровня (минимум 1)
- `show()` / `hide()` - показать или скрыть HUD
- `setHandlers({ onBack, onRestart, onStateChange })`
- `getState()` - возвращает `{ level, visible }`
- `destroy()` - удалить HUD из DOM

## Важно

- Верстка и размеры перенесены из текущего `Puzzle` экрана.
- Стили изолированы префиксом `mh-` для минимизации конфликтов.
