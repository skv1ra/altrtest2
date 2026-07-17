"use client";

import { ContactShadows, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Lang } from "./scene-data";
import styles from "./Hero3D.module.css";

const MACBOOK_MODEL = "/api/hero-model/macbook";
const IPHONE_MODEL = "/api/