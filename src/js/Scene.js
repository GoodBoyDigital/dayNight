// Scene.js

import HelperDotsPlane from './helpers/HelperDotsPlane';
import HelperAxis from './helpers/HelperAxis';
import Camera from './cameras/Camera';
import OrbitalControl from './helpers/OrbitalControl';

import parseObj from './loaders/objParser';
import vs from 'shaders/basic.vert';
import vsOutline from 'shaders/outline.vert';
import fs from 'shaders/test.frag';
import fsColor from 'shaders/color.frag';
import fsBox from 'shaders/box.frag';

const RAD = Math.PI/180;
var random = function(min, max) { return min + Math.random() * (max - min);	}

class Scene {
	constructor() {
		this._init();
		window.addEventListener('resize', ()=>this.resize());
	}


	_init() {
		//	SETUP PIXI
		this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {antialias:true, transparent:true});
		console.log(this.renderer);
		document.body.appendChild(this.renderer.view);
		this.renderer.view.className = 'Main-Canvas';
		this.stage = new PIXI.Container();

		//	CAMERAS
		this.camera = new Camera();
		this.camera.setPerspective(75 * RAD, window.innerWidth / window.innerHeight, .1, 50);
		this.orbtialControl = new OrbitalControl(this.camera);
		this.orbtialControl.rx.value = this.orbtialControl.ry.value = 0.3;
		this.orbtialControl.radius.value = 5;
		this.orbtialControl.radius.limit(5, 7);
		this.orbtialControl.rx.limit(-.5, .5);

		const uniforms = {
			uViewMatrix:this.camera.view,
			uProjectionMatrix:this.camera.projection,
			scale:[1, 1, 1],
			position:[0, 0, 0]
		}
		this.uniforms = uniforms;

		const geometryCube = parseObj(getAsset('cube'));
		const geometryBg = parseObj(getAsset('bg'));
		
		const shader = new PIXI.Shader.from(vs, fs, uniforms);


		//	outer cube - white
		const uniformOuterBox = {
			...uniforms,
			color:[1, 1, 1]
		}
		const shaderOuterCube = new PIXI.Shader.from(vs, fsColor, uniformOuterBox);
		this.meshOuterCube = new PIXI.mesh.RawMesh(geometryCube, shaderOuterCube);
		this.stage.addChild(this.meshOuterCube);
		this.meshOuterCube.state.depthTest = true;
		this.meshOuterCube.state.culling = true;
		this.meshOuterCube.state.clockwiseFrontFace = true;

		const scaleInnerBox = [.99, .99, 1];

		//	inner cube
		this.uniformInnerBox = {
			...uniforms,
			color:[1, 1, 1],
			scale:scaleInnerBox
		}
		const shaderInnerBox = new PIXI.Shader.from(vs, fsColor, this.uniformInnerBox);
		this.innerBox = new PIXI.mesh.RawMesh(geometryCube, shaderInnerBox);
		this.innerBox.state.depthTest = true;
		this.innerBox.state.culling = true;
		this.stage.addChild(this.innerBox);


		// 	bg
		this.uniformBg = {
			...uniforms,
			color:[1, 1, 1],
			position:[0, 0, -2],
			scale:scaleInnerBox
		}
		const shaderBg = new PIXI.Shader.from(vs, fsColor, this.uniformBg);
		this.bg = new PIXI.mesh.RawMesh(geometryBg, shaderBg);
		this.stage.addChild(this.bg);
		this.bg.state.depthTest = true;
		this.bg.state.culling = true;

		this._createScene();
		this._createWolf();
		this._createSnow();

		this.frame = 0;
		this.fps = 24 * 2;
		this.run();

		//	RENDERING
		this.render();
	}


	_createScene() {
		const geometryDay = parseObj(getAsset('day'));
		const geometryNight = parseObj(getAsset('night'));

		const uniforms = this.uniforms;
		//	scene
		this.uniformScene = {
			...uniforms,
			color:[1, 1, 1]
		}
		const shaderScene = new PIXI.Shader.from(vs, fsColor, this.uniformScene);
		this.day = new PIXI.mesh.RawMesh(geometryDay, shaderScene);
		this.stage.addChild(this.day);
		this.day.state.depthTest = true;
		this.day.state.culling = true;

		this.night = new PIXI.mesh.RawMesh(geometryNight, shaderScene);
		this.stage.addChild(this.night);
		this.night.state.depthTest = true;
		this.night.state.culling = true;

		this.uniformOutline = {
			...this.uniformScene,
			lineWidth:0.02,
			color:[0, 0, 0]
		}

		const shaderOutline = new PIXI.Shader.from(vsOutline, fsColor, this.uniformOutline);
		this.dayOutline = new PIXI.mesh.RawMesh(geometryDay, shaderOutline);
		this.stage.addChild(this.dayOutline);
		this.dayOutline.state.depthTest = true;
		this.dayOutline.state.culling = true;
		this.dayOutline.state.clockwiseFrontFace = true;

		this.nightOutline = new PIXI.mesh.RawMesh(geometryNight, shaderOutline);
		this.stage.addChild(this.nightOutline);
		this.nightOutline.state.depthTest = true;
		this.nightOutline.state.culling = true;
		this.nightOutline.state.clockwiseFrontFace = true;
	}

	_createWolf() {
		//	wolf
		const getStr = function(num) {
			let s = num.toString();
			while(s.length < 2) {
				s = '0' + s;
			}

			return s;
		}

		let yOffset = -0.63;

		this.uniformWolf = {
			...this.uniformScene,
			position:[0, yOffset, 0]
		}

		this.uniformWolfOutline = {
			...this.uniformOutline,
			position:[0, yOffset, 0]
		}

		const shaderWolf = new PIXI.Shader.from(vs, fsColor, this.uniformWolf)
		const shaderWolfOutline = new PIXI.Shader.from(vsOutline, fsColor, this.uniformWolfOutline)

		this._wolf = [];
		for(let i=1; i<=16; i++) {
			const geometryWolf = parseObj(getAsset(`wolf${getStr(i)}`));
			const wolf = new PIXI.mesh.RawMesh(geometryWolf, shaderWolf);
			const wolfOutline = new PIXI.mesh.RawMesh(geometryWolf, shaderWolfOutline);

			wolf.state.depthTest = true;
			wolf.state.culling = true;

			wolfOutline.state.depthTest = true;
			wolfOutline.state.culling = true;
			wolfOutline.state.clockwiseFrontFace = true;

			this.stage.addChild(wolf);
			this.stage.addChild(wolfOutline);
			wolf.visible = false;
			wolfOutline.visible = false;
			this._wolf.push({
				wolf,
				wolfOutline
			});
		}
	}

	_createSnow() {
		const numParticles = 50;
		const r = 1.8;
		const getRandomPos = function() {
			return [random(r, -r), random(r, -r), random(r, -r)];
		}

		const getRandomScale = function() {
			const s = random(.015, .05);
			return [s, s, s];
		}

		const geometrySphere = parseObj(getAsset('sphere'));
		this._particles = [];
		for(let i=0; i<numParticles; i++) {
			const uniforms = {
				...this.uniforms,
				position:getRandomPos(),
				scale:getRandomScale(),
				color:[1, 1, 1]
			}

			const uniformOutline = {
				...uniforms,
				lineWidth:0.02,
				color:[0, 0, 0]
			}
			const shader = new PIXI.Shader.from(vs, fsColor, uniforms);
			const shaderOutline = new PIXI.Shader.from(vsOutline, fsColor, uniformOutline);
			const mesh = new PIXI.mesh.RawMesh(geometrySphere, shader);
			const meshOutline = new PIXI.mesh.RawMesh(geometrySphere, shaderOutline);
			mesh.state.depthTest = true;
			mesh.state.culling = true;
			meshOutline.state.depthTest = true;
			meshOutline.state.culling = true;
			meshOutline.state.clockwiseFrontFace = true;
			this.stage.addChild(mesh);
			this.stage.addChild(meshOutline);

			this._particles.push({
				uniforms,
				uniformOutline,
				mesh,
				meshOutline,
				shader,
				speedY:random(.01, .02) * 0.5,
				speedZ:random(.01, .02)
			});
		}
	}


	run() {

		this._wolf.forEach((o,i)=> {
			o.wolf.visible = i === this.frame;
			o.wolfOutline.visible = i === this.frame;
		});


		this.frame ++;
		if(this.frame == this._wolf.length) {
			this.frame = 0;
		}

		setTimeout(()=> {
			this.run();
		}, 1000/this.fps);
	}


	_updateSnow(mVisible) {
		this._particles.forEach((p)=> {
			const { mesh, meshOutline, uniforms, uniformOutline, speedY, speedZ } = p;
			mesh.visible = meshOutline.visible = mVisible;
			const r = 1.8;

			if(mVisible) {
				const { position } = uniforms;
				position[1] -= speedY;
				position[2] -= speedZ;
				if(position[1] < -r) position[1] += r*2;
				if(position[2] < -r) position[2] += r*2;
				uniformOutline.position = position;
			}
		});
	}


	render() {
		
		let angle = (this.orbtialControl.ry.value / RAD + 360) % 360;

		if(angle > 90 && angle < 270) {
			//	show black
			this.uniformInnerBox.color = [0, 0, 0];
			this.uniformBg.color = [0, 0, 0];
			this.uniformBg.position = [0, 0, 2];
			this.bg.state.clockwiseFrontFace = true;
			this.uniformOutline.color = [1, 1, 1];
			this.uniformScene.color = [0, 0, 0];

			this.uniformWolfOutline.color = [1, 1, 1];
			this.uniformWolf.color = [0, 0, 0];

			this.day.visible = false;
			this.dayOutline.visible = false;
			this.night.visible = true;
			this.nightOutline.visible = true;

			this._updateSnow(false);
		} else {
			//	show white
			this.uniformInnerBox.color = [1, 1, 1];
			this.uniformBg.color = [1, 1, 1];
			this.uniformBg.position = [0, 0, -2];
			this.bg.state.clockwiseFrontFace = false;
			this.uniformOutline.color = [0, 0, 0];
			this.uniformScene.color = [1, 1, 1];

			this.uniformWolfOutline.color = [0, 0, 0];
			this.uniformWolf.color = [1, 1, 1];

			this.day.visible = true;
			this.dayOutline.visible = true;
			this.night.visible = false;
			this.nightOutline.visible = false;

			this._updateSnow(true);
		}


		requestAnimationFrame(()=>this.render());
		this.renderer.render(this.stage);
	}

	resize() {
		this.renderer.resize(window.innerWidth, window.innerHeight);
		this.camera.setPerspective(75 * RAD, window.innerWidth / window.innerHeight, .1, 50);
	}
}


export default Scene;