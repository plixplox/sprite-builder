#!/usr/bin/env node

const {series, src, dest} = require('gulp');
const svgSprite = require('gulp-svg-sprite');
const cheerio = require('gulp-cheerio');
const fs = require('fs');

const {sprite} = require('../../package.json')

const Options = {
  cleanupAttrs: true,
  inlineStyles: true,
  removeAttrs: {attrs: '(stroke|fill)'},
  removeComments: true,
  removeTitle: true,
  removeDesc: true,
  removeUselessDefs: true,
  removeMetadata: true,
  removeEditorsNSData: true,
  removeEmptyAttrs: true,
  removeHiddenElems: true,
  removeEmptyText: true,
  removeEmptyContainers: true,
  minifyStyles: true,
  removeUnknownsAndDefaults: true,
  removeUselessStrokeAndFill: true,
  cleanupIDs: false,
};

const config = {
  mode: {
    symbol: {
      dest: './',
      sprite: 'sprite.symbol.svg',
      transform: [
        {
          svgo: Options,
        },
      ],
    },
  },
};

function run() {
  console.log('Start run')

  return src(sprite.selector, {cwd: sprite.src})
    .pipe(
      cheerio({
        run: function ($) {
          if ($('rect').attr('id') == 'Overlay') {
            $('rect').remove()
          }
          $('[fill]').each(function () {
            if (['black', '#000', '#000000', '#1A3049', '#6F7987', 'none'].includes($(this).attr('fill'))) {
              $(this).removeAttr('fill');
            }
          })
          $('[fill-rule]').removeAttr('fill-rule');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
          // $('[clip-rule]').removeAttr('clip-rule');
          // $('g').removeAttr('class');
          // $('path').removeAttr('class');
        },
        parserOptions: {xmlMode: true},
      })
    )
    .pipe(svgSprite(config))
    .pipe(dest(sprite.dist))
}

function preview(cb) {
  const fileHtml = new Promise((resolve, reject) => {
    fs.readFile(`${sprite.dist}/sprite.symbol.svg`, 'utf8', function (err, svgDefinitions) {
      if (err) {
        reject(err);
      }
      const icons = svgDefinitions.match(/(?<=<symbol)([\s\S]*?)(?=<\/symbol>)/g).map((svg) => {
        const name = svg.match(/(?<=id=")([\s\S]*?)(?=")/g);
        return `<div class="group" data-name="${name}">
  <svg${svg}</svg>
  <div class="group-name">${name}</div>
</div>
`;
      });
      resolve(`<div class="groups">${icons.join('')}`);
      console.log('Svg created!')
    });
  })

  fileHtml.then((html) => {
    const styles = `* {margin: 0; padding: 0; box-sizing: border-box;}
body {font-family: 'Roboto', sans-serif;font-size: 14px;}
.groups {width: 801px; margin: 18px auto; display: flex;flex-wrap: wrap;justify-content: center;}
.group {width: 200px;display: flex; align-items:center; padding: 10px; border: 1px solid #d2d2d2; margin: 0 -1px -1px 0; }
.group:active, .group:focus {background-color: #ececec;}
.group svg {width: 24px; height: 24px; display: block; margin: 8px; border-radius: 6px; box-shadow: 0 0 15px rgb(0 0 0 / 0%); fill: currentColor;}
.group > * {pointer-events: none;}
.group-name {font-size: 14px; margin-left: 8px;}
`
    const js = `document.querySelectorAll('.group').forEach(el => el.addEventListener('click', event => {
  var inp = document.createElement('input');
  document.body.appendChild(inp)
  inp.value = event.target.getAttribute("data-name")
  inp.select();
  document.execCommand('copy',false);
  inp.remove();
}));
`;
    const template = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>ICON pack</title><style>${styles}</style></head><body>${html}<script>${js}</script></body></html>`;
    fs.writeFile(`${sprite.dist}/preview.html`, template, 'utf8', function (err) {
      if (err) return console.log(err);
    });

    console.log('Preview created!')
    cb();
  });
}

series(run, preview)();
