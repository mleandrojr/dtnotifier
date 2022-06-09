import path from "path";
import dotenv from "dotenv";
import dbus from "dbus-next";
import fetch from 'node-fetch';

dotenv.config({
    path : path.resolve() + "/.env"
});

const bus = dbus.sessionBus();
bus.getProxyObject("org.freedesktop.DBus", "/org/freedesktop/DBus").then((obj) => {

    let monitor = obj.getInterface("org.freedesktop.DBus.Monitoring");

    monitor.BecomeMonitor([
        "type='signal',member='Notify',path='/org/freedesktop/Notifications',interface='org.freedesktop.Notifications'",
        "type='method_call',member='Notify',path='/org/freedesktop/Notifications',interface='org.freedesktop.Notifications'",
        "type='method_return',member='Notify',path='/org/freedesktop/Notifications',interface='org.freedesktop.Notifications'",
        "type='error',member='Notify',path='/org/freedesktop/Notifications',interface='org.freedesktop.Notifications'"
    ], 0);

    bus.on("message", (payload) => {

        if (payload.type !== 1) {
            return;
        }

        if (!payload.body.length) {
            return;
        }

        let content = [];
        for (let i = 0, length = payload.body.length; i < length; i++) {
            if (typeof payload.body[i] === "string") {
                content.push(payload.body[i]);
            }
        }

        if (!content.length) {
            return;
        }

        const message = `<strong>${content[0]}</strong>\n\n` + content.slice(1).join("\n");

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const receiverId = process.env.TELEGRAM_RECEIVER_ID;

        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const body = JSON.stringify({
            chat_id: receiverId,
            text: message,
            parse_mode: "HTML"
        });

        const headers = {
            "Content-Type" : "application/json",
            "Content-Length" : message.length.toString()
        };

        const params = {
            method  : "POST",
            headers : headers,
            body    : body
        };

        return fetch(url, params);
    });
});
