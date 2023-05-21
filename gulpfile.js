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
}

const path = {
    src: {
        files: basePath.src + "/files/**/*.*",
    },
    dev: {
        files: basePath.dev + "/files/",
    },
    watch: {
        files: basePath.src + "/files/**/*.*",
    },

    clean: basePath.dev,
}

// Задачи

const copy = () => {
    return gulp.src(path.src.files)
        .pipe(gulp.dest(path.dev.files))
}

    // Подключение плагина DEL
import {deleteAsync} from "del"

const reset = () => {
    return deleteAsync([path.clean])
}

// Обработка html
export const html = () => {
    return app.gulp.src(app.path.src.html)

        // Уведомления об ошибках
        .pipe(app.plugins.plumber(
            app.plugins.notify.onError({
                title: "HTML",
                message: "Error: <%= error.message %>"
            }))
        )

        // Сборка html-файлов
        .pipe(posthtml([
            include()
          ]))

        // Подмена путей до изображений
        .pipe(app.plugins.replace(/@img\//g, 'img/'))

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
        .pipe(app.gulp.dest(app.path.build.root))
        .pipe(app.plugins.browsersync.stream());
}

// Наблюдатель за изменениями в файлах
function watcher() {
    gulp.watch(path.watch.files, copy);
}

// Основные задач
const mainTasks = gulp.parallel(copy);

// Построение сценариев выполнения задач
const dev = gulp.series(reset, copy, watcher);

export { dev }

//Выполнение сценария по умолчанию
gulp.task('default', dev);