"use strict";

import gulp from "gulp";

// Получаем имя папки проекта (build-2023)
import * as nodePath from 'path';
const rootFolder = nodePath.basename(nodePath.resolve());
import fs from "fs";

// Импорт путей
const basePath = {
    src: "./src",
    dev: "./dev", // Также можно использовать rootFolder
    files: "./src/files"
}

const path = {
    src: {
        files: basePath.files + "/**/*.*",
        html: basePath.src + "/*.html",
    },
    dev: {
        files: basePath.dev + "/files/",
        root: basePath.dev,
    },
    watch: {
        files: basePath.files + "/**/*.*",
        html: [basePath.src + '/*.html'], // Сюда добавим пути к файлам блоков чуть ниже по коду
    },

    clean: basePath.dev,
}

// Массив для списка папок блоков, заполнится сам чуть ниже по коду
let blocks = [];

// Получаем список блоков и записываем их в массив blocks
if (basePath.blocks) {
    fs.readdirSync(basePath.blocks).forEach(function (directory) {
        blocks.push(directory);
        console.log(blocks);
    });
}

// Добавляем к path.src.componentsWatch пути к блокам
blocks.forEach (function (block) {
    path.watch.scss.push(basePath.components + '/blocks/' + block + '/*.scss');
});

// Добавляем к path.src.htmlWatch пути к блокам
blocks.forEach (function (block) {
    path.watch.html.push(basePath.components + '/blocks/' + block + '/*.html');
});

// Общие плагины
import replace from "gulp-replace"; // Поиск и замена
import plumber from "gulp-plumber"; // Обработка ошибок
import notify from "gulp-notify"; // Сообщения (подсказки)
import browsersync from "browser-sync"; // Сообщения (подсказки)
import newer from "gulp-newer"; // Проверка обновления

// Задачи

// Копирование файлов (тестовая)
const copy = () => {
    return gulp.src(path.src.files)
        .pipe(gulp.dest(path.dev.files))
}

import posthtml from "gulp-posthtml";
import include from "posthtml-include";
import webpHtmlNosvg from "gulp-webp-html-nosvg";
import versionNumber from "gulp-version-number";
import htmlBeautify from "gulp-html-beautify";

// Обработка html
const html = () => {
    return gulp.src(path.src.html)

        // Уведомления об ошибках
        .pipe(plumber(
            notify.onError({
                title: "HTML",
                message: "Error: <%= error.message %>"
            }))
        )

        // Сборка html-файлов
        .pipe(posthtml([
            include()
          ]))

          // Подмена путей до изображений
        .pipe(replace('../', './img/'))


        // Добавление варианта webp изображений и тега picture
        .pipe(webpHtmlNosvg())

        // Версионность файлов стилей и скриптов
        .pipe(
            versionNumber({
                'value': '%DT%',
                'append': {
                    'key': '_v',
                    'cover': 0,
                    'to': [
                        'css',
                        'js',
                    ]
                },
                'output': {
                    'file': 'gulp/version.json'
                }
            })
        )
        .pipe(htmlBeautify())
        .pipe(gulp.dest(path.dev.root))
        .pipe(browsersync.stream());
}

// Подключение плагина DEL
import {deleteAsync} from "del"

const reset = () => {
    return deleteAsync([path.clean])
}

const configFTP = {
    host: "", // Адрес FTP сервера
    user: "", // Имя пользователя
    password: "", // Пароль
    parallel: 5 // количество одновременных потоков
}

// Наблюдатель за изменениями в файлах
function watcher() {
    gulp.watch(path.watch.files, copy);
    gulp.watch(path.watch.html, html);
}

// Основные задач
const mainTasks = gulp.parallel(copy, html);

// Построение сценариев выполнения задач
const dev = gulp.series(reset, html, watcher);

export { dev }

//Выполнение сценария по умолчанию
gulp.task('default', dev);