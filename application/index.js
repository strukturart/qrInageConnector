"use strict";

import localforage from "localforage";

import m from "mithril";
import dayjs from "dayjs";

import "swiped-events";
import "font-awesome/css/font-awesome.min.css";

import { stop_scan, start_scan } from "./assets/js/scan.js";

try {
  navigator.serviceWorker
    .register(new URL("sw.js", import.meta.url), {
      type: "module",
    })
    .then((registration) => {
      if (registration.waiting) {
        // There's a new service worker waiting to activate
        // You can prompt the user to reload the page to apply the update
        // For example: show a message to the user
      } else {
        // No waiting service worker, registration was successful
      }
    });
} catch (e) {
  console.log(e);
}

const scan_callback = (e) => {
  sessionStorage.setItem("filename", e);
  m.route.set("/photo");
};

let root = document.getElementById("app");

let start = {
  view: () => {
    return m("div", [
      m("div", [
        m("ol", [
          m("li", "Qr-Code scannen oder ID eingeben"),
          m("li", "Foto aufnehmen"),
          m("li", "Foto lokal speichern"),
        ]),
      ]),
      m(
        "button",
        {
          onclick: () => {
            m.route.set("/qr");
          },
        },
        "QR-Code scannen"
      ),
      m(
        "button",
        {
          style: "display:block;margin-top:10px;",
          onclick: () => {
            m.route.set("/id");
          },
        },
        "ID eingeben"
      ),
    ]);
  },
};

var qr = {
  view: function (vnode) {
    return m("div", { class: "row" }, [
      m(
        "button",
        {
          onclick: () => {
            stop_scan();
            m.route.set("/start");
          },
        },
        "Cancel"
      ),
      m("div", { class: "col-xs-12 debug" }, [
        m("video", {
          oncreate: () => {
            start_scan(scan_callback);
          },
        }),
      ]),
    ]);
  },
};

let id = {
  value: "",

  view: () => {
    return m("div", { class: "row" }, [
      m("input[type=text]", {
        class: "input",
        placeholder: "ID eingeben",
        value: id.value,
        oncreate: (vnode) => {
          vnode.dom.focus();
        },
        oninput: (e) => (id.value = e.target.value),
      }),
      m(
        "button",
        {
          class: "btn",
          onclick: () => {
            sessionStorage.setItem("filename", id.value);
            m.route.set("/photo");
          },
        },
        "OK"
      ),
      m(
        "button",
        {
          class: "btn",
          style: "margin:0 0 0 10px;",

          onclick: () => {
            sessionStorage.setItem("filename", id.value);
            m.route.set("/start");
          },
        },
        "Cancel"
      ),
    ]);
  },
};

var photo = {
  photoUrl: null,
  photofilename: null,
  view: () =>
    m("div", [
      m("div", "Wähle das Foto aus, welches zu der ID gehört."),

      m("input[type=file][accept=image/*][capture=environment]", {
        onchange: (e) => {
          let file = e.target.files[0];
          if (file) {
            photo.photoUrl = URL.createObjectURL(file);
            photo.photofilename = sessionStorage.getItem("filename") + ".jpg";
            m.redraw(); // sofort neu rendern
          }
        },
      }),

      photo.photoUrl
        ? m("div", { style: "margin-top:1em;" }, [
            m("img", {
              src: photo.photoUrl,
              style:
                "width:90%;border:2px solid blue;display:block;margin-bottom:0.5em;",
            }),
            m(
              "span",
              { style: "font-weight:bold;display:block;margin-bottom:1em;" },
              photo.photofilename
            ),

            // Download-Button
            m(
              "button",
              {
                onclick: () => {
                  let a = document.createElement("a");
                  a.href = photo.photoUrl;
                  a.download = photo.photofilename;
                  a.click();
                  m.route.set("/start");
                },
                style:
                  "padding:0.5em 1em; background:blue; color:white; border:none; border-radius:5px;",
              },
              "Download"
            ),
          ])
        : null,
    ]),
};

m.route(root, "/start", {
  "/start": start,
  "/photo": photo,
  "/qr": qr,
  "/id": id,
});
