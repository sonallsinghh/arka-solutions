class Polygon {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.vertices = [];
        this.isCompleted = false;
        this.isCopying = false;
        this.copiedVertices = [];

        this.initEventListeners();
    }

    handleClick(x, y) {
        if (this.isCompleted || this.isCopying) return;

        const vertex = new THREE.Vector3(x - window.innerWidth / 2, y - window.innerHeight / 2, 0);
        this.vertices.push(vertex);

        this.drawVertex(vertex);
        if (this.vertices.length > 1) {
            this.drawEdge(this.vertices[this.vertices.length - 2], vertex);
        }
    }

    completePolygon() {
        if (this.vertices.length < 3 || this.isCompleted) return;

        this.isCompleted = true;

        this.drawEdge(this.vertices[this.vertices.length - 1], this.vertices[0]);
        this.fillPolygon(0x0080ff);
        this.drawPolygonEdges(0xff0000);
    }

    copyPolygon() {
        if (!this.isCompleted || this.isCopying) return;

        this.isCopying = true;
        this.copiedVertices = [...this.vertices];

        window.addEventListener('mousemove', this.moveCopiedPolygon.bind(this));
    }

    drawVertex(vertex) {
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const geometry = new THREE.CircleGeometry(0.1, 16);
        const vertexObj = new THREE.Mesh(geometry, material);
        vertexObj.position.copy(vertex);
        this.scene.add(vertexObj);
    }

    drawEdge(start, end) {
        const material = new THREE.LineBasicMaterial({ color: 0x000000 });
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
    }

    fillPolygon(color) {
        const geometry = new THREE.BufferGeometry().setFromPoints(this.vertices);
        const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
        const polygon = new THREE.Mesh(geometry, material);
        this.scene.add(polygon);
    }

    drawPolygonEdges(color) {
        for (let i = 0; i < this.vertices.length; i++) {
            const start = this.vertices[i];
            const end = this.vertices[(i + 1) % this.vertices.length];
            this.drawEdge(start, end);
        }
    }

    moveCopiedPolygon(event) {
        if (!this.isCopying) return;

        // Clear previous copied polygon
        this.scene.children = this.scene.children.filter(child => !(child instanceof THREE.Mesh) && !(child instanceof THREE.Line));

        // Redraw original polygon
        if (this.isCompleted) {
            this.fillPolygon(0x0080ff);
            this.drawPolygonEdges(0xff0000);
        }

        const mouseX = event.clientX - window.innerWidth / 2;
        const mouseY = event.clientY - window.innerHeight / 2;

        const offsetVertices = this.copiedVertices.map(vertex => new THREE.Vector3(vertex.x + mouseX, vertex.y + mouseY, 0));

        this.fillPolygon(0x00ff80);
        this.drawPolygonEdges(0x00ff00);
    }

    placeCopiedPolygon() {
        window.removeEventListener('mousemove', this.moveCopiedPolygon.bind(this));
        this.isCopying = false;
    }

    reset() {
        this.vertices = [];
        this.isCompleted = false;
        this.isCopying = false;
        this.copiedVertices = [];

        // Remove all polygons and lines
        this.scene.children = this.scene.children.filter(child => !(child instanceof THREE.Mesh) && !(child instanceof THREE.Line));
    }

    initEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    onWindowResize() {
        this.camera.left = window.innerWidth / -2;
        this.camera.right = window.innerWidth / 2;
        this.camera.top = window.innerHeight / 2;
        this.camera.bottom = window.innerHeight / -2;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.reset();
    }
}
