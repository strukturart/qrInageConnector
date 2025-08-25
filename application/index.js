"use strict";

import localforage from "localforage";

import m from "mithril";
import dayjs from "dayjs";

import "swiped-events";
import "font-awesome/css/font-awesome.min.css";

import { stop_scan, start_scan } from "./assets/js/scan.js";

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
  view: () =>
    m("div", [
      m("input[type=file][accept=image/*][capture=environment]", {
        onchange: (e) => {
          let file = e.target.files[0];
          if (file) {
            photo.photoUrl = URL.createObjectURL(file);
            let a = document.createElement("a");
            a.href = photo.photoUrl;
            a.download = sessionStorage.getItem("filename") + ".jpg";
            a.click();
          }
        },
      }),
      photo.photoUrl
        ? m("img", { src: photo.photoUrl, style: "max-width:100%" })
        : null,
    ]),
};

m.route(root, "/start", {
  "/start": start,
  "/photo": photo,
  "/qr": qr,
  "/id": id,
});
