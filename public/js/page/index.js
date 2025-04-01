class LinkedList {
    first = null;
    last = null;

    constructor() {

    }

    add(value) {
        const child = new LinkedListNode(value);
        if (this.first === null) {
            this.last = this.first = child;
            return;
        }

        const last = this.last;
        last.next = child;
        child.prev = last;
        this.last = child;
    }

    /**
     * @param node {LinkedListNode}
     * */
    remove(node) {
        if (node === null || this.first === null) {
            return;
        }

        let child = this.first;
        while (child !== null) {
            if (child === node) {
                const next = child.next;
                const prev = child.prev;
                next.prev = prev;
                prev.next = next;

                if (child === this.first) {
                    this.first = child.next;
                }

                if (child === this.last) {
                    this.last = child.prev;
                }

                break
            }

            child = child.next;
        }
    }

    get(i) {
        if (i === 0) {
            return this.first;
        }

        let node = this.first;
        for (let k = 0; node != null; k++) {
            if (k === i) {
                return node;
            }
            node = node.next;
        }
        return node;
    }

    find(filter) {
        if (this.first === null) {
            return null;
        }

        let x = this.first;
        while (x !== null) {
            if (filter(x.value)) {
                return x;
            }
            x = x.next;
        }

        return null;
    }

    isEmpty() {
        return this.first === null;
    }
}

class LinkedListNode {
    next = null;
    prev = null;

    value = null;

    constructor(value) {
        this.value = value;
    }
}

class Scene {
    layers = new LinkedList();
    offset = {x: 0, y: 0};
    view = null;
    eventDispatcher = null;
    mouse = {x: 0, y: 0, pressed: false};

    constructor() {
        this.eventDispatcher = new EventTarget();
    }

    getLayer(id) {
        const layerId = "layer-" + id;
        const x = this.layers.find(layer => layer.id === layerId);
        if (x === null) {
            return null;
        }

        return x.value;
    }

    addLayer(layer) {
        this.layers.add(layer);
    }

    appendTo(view) {
        this.view = view;
        let snap = {x: 0, y: 0};
        view.addEventListener("mousemove", e => {
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;

            const diff = {x: this.mouse.x - snap.x, y: this.mouse.y - snap.y};
            snap = {x: this.mouse.x, y: this.mouse.y};

            if (this.mouse.pressed) {
                this.offset.x += diff.x;
                this.offset.y += diff.y;
            }
        });
        view.addEventListener("mousedown", e => {
            this.mouse.pressed = true;
        });
        view.addEventListener("mouseup", e => {
            const isDragend = this.mouse.pressed;
            this.mouse.pressed = false;
            if (isDragend) {
                dragdrop.x2 = this.mouse.x;
                dragdrop.y2 = this.mouse.y;

                this.eventDispatcher.dispatchEvent(new CustomEvent("dragdrop", {detail: dragdrop}));
            }
        });

        //todo: start listen view
        //todo: drag&drop scene
        //todo: draw nodes with offset

        let x = this.layers.first;
        while (x !== null) {
            view.appendChild(x.value.view);
            x = x.next;
        }
    }

    draw() {
        let x = this.layers.first;
        while (x !== null) {
            x.value.draw(this.offset);
            x = x.next;
        }
    }

    addEventListener(type, callback) {
        this.eventDispatcher.addEventListener(type, callback);
    }
}

class Layer {

    child = new LinkedList();
    context = null;

    constructor(id) {
        this.view = document.createElement("canvas");
        this.id = this.view.id = "layer-" + id;
        this.view.width = window.innerWidth;
        this.view.height = window.innerHeight;
    }

    add(node) {
        this.child.add(node);
    }

    remove(node) {
        const x = this.child.find(child => child.value === node);
        this.child.remove(x);
    }

    draw(offset) {
        if (this.context === null) {
            this.context = this.view.getContext("2d");
        }

        this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.context.beginPath();

        let child = this.child.get(0);
        while (child !== null) {
            child.value.draw(this.context, offset);
            child = child.next;
        }
    }
}

class Node {

    id = "";
    x = 0;
    y = 0;

    constructor(id) {
        if (id == null) {
            throw new Error("id is required");
        }

        this.id = id;
    }

    draw(ctx, offset) {

    }

    getPos() {
        return {x: this.x, y: this.y};
    }

    setPos({x, y}) {
        this.x = x;
        this.y = y;
    }
}

class Rect extends Node {

    width = 100;
    height = 100;
    color = "black";

    constructor({id, pos, size, color}) {
        if (pos == null) {
            throw new Error("pos is required");
        }
        super(id);
        this.setPos(pos)
        this.width = size.width || this.width;
        this.height = size.height || this.height;
        this.color = color;
    }

    draw(ctx, offset) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + offset.x, this.y + offset.y, this.width, this.height);
    }
}

class RoundedRect extends Rect {
    radius = 10;

    constructor({id, pos, size, color, radius}) {
        super({id, pos, size, color});
        this.radius = radius;
    }

    draw(ctx, offset) {
        ctx.fillStyle = this.color;
        ctx.roundRect(this.x + offset.x, this.y + offset.y, this.width, this.height, this.radius);
        ctx.fill();
    }
}

class Sprite extends Node {
    texture = null;

    constructor({id, pos, texture}) {
        super(id)
        this.texture = texture;
        this.setPos(pos)
    }

    draw(ctx, offset) {
        ctx.drawImage(this.texture, this.x + offset.x, this.y + offset.y);
    }
}

window.app = {ready: false, scene: null, sprites: {}};
app.loadSprite = function (id, url) {
    return fetch(url)
        .then(x => x.blob())
        .then(x => createImageBitmap(x, {resizeWidth: 64, resizeHeight: 64, resizeQuality: "high"}))
        .then(x => app.sprites[id] = x);
}

window.addEventListener('DOMContentLoaded', function () {
    const $view = document.getElementById("view");

    const scene = new Scene();

    const top = new Layer("top");
    const bottom = new Layer("bottom");
    const ground = new Layer("ground");

    scene.addLayer(ground);
    scene.addLayer(bottom);
    scene.addLayer(top);

    scene.appendTo($view)

    window.app.scene = scene;
    window.app.ready = true;

    Promise.all([app.loadSprite("trees", "trees.png")])
        .then(() => window.dispatchEvent(new CustomEvent("app-ready")));
})

window.addEventListener("app-ready", function () {
    const width = 64;
    const s1 = new Sprite({id: "tree1", pos: {x: 100, y: 100}, texture: app.sprites["trees"]});
    const s2 = new Sprite({id: "tree2", pos: {x: 100 + width, y: 100}, texture: app.sprites["trees"]});
    const s3 = new Sprite({id: "tree2", pos: {x: 100 + width * 2, y: 100}, texture: app.sprites["trees"]});

    const layer = app.scene.getLayer("top");
    layer.add(s1);
    layer.add(s2);
    layer.add(s3);

    function frame() {
        app.scene.draw();
        requestAnimationFrame(frame);
    }

    frame();
})

