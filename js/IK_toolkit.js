import * as THREE from 'three';

class IK_toolkit {
    constructor() {
        this.DH = [
            { a: 0,       alpha: Math.PI / 2, d: 0.1807 },  // Joint 1
            { a: -0.4784, alpha: 0,           d: 0 },       // Joint 2
            { a: -0.36,   alpha: 0,           d: 0 },       // Joint 3
            { a: 0,       alpha: Math.PI / 2, d: 0.17415 }, // Joint 4
            { a: 0,       alpha: -Math.PI/ 2, d: 0.11985 }, // Joint 5
            { a: 0,       alpha: 0,           d: 0.11655 }  // Joint 6
        ];
    }

    computeTransformMatrix(jointIndex, jointAngles) {
        const { a, alpha, d } = this.DH[jointIndex];
        const theta = jointAngles[jointIndex];

        const c_th = Math.cos(theta);
        const s_th = Math.sin(theta);
        const c_al = Math.cos(alpha);
        const s_al = Math.sin(alpha);

        const matrix = new THREE.Matrix4();
        matrix.set(
            c_th, -s_th * c_al,  s_th * s_al, a * c_th,
            s_th,  c_th * c_al, -c_th * s_al, a * s_th,
               0,         s_al,         c_al,        d,
               0,            0,            0,        1
        );
        return matrix;
    }

    inverseKinematicSolutions(targetMatrix, movableSphere) {
        // Create a 2D array to store the 8 possible solutions for the 6 joints.
        // Initialize with NaN to indicate that a solution has not yet been computed.
        const theta = Array(6).fill(0).map(() => Array(8).fill(NaN));

        if (!movableSphere) {
            console.error("movableSphere is not defined. Skipping IK calculation.");
            return theta;
        }

        this._calculateTheta1(targetMatrix, theta);
        this._calculateTheta5(targetMatrix, theta);
        this._calculateTheta6(targetMatrix, theta);
        this._calculateTheta234(targetMatrix, theta);

        return theta;
    }

    _calculateTheta1(targetMatrix, theta) {
        const d6 = this.DH[5].d;
        const P05 = new THREE.Vector4(0, 0, -d6, 1).applyMatrix4(targetMatrix);
        const psi = Math.atan2(P05.y, P05.x);
        const phi_num = this.DH[1].d + this.DH[3].d + this.DH[2].d;
        const phi_den = Math.sqrt(P05.x**2 + P05.y**2);

        if (phi_den < Math.abs(phi_num)) return; // Target is unreachable

        const phi = Math.acos(phi_num / phi_den);

        for(let i = 0; i < 4; i++) theta[0][i] = psi + phi + Math.PI / 2;
        for(let i = 4; i < 8; i++) theta[0][i] = psi - phi + Math.PI / 2;
    }

    _calculateTheta5(targetMatrix, theta) {
        const T = targetMatrix.elements;
        const d6 = this.DH[5].d;
        const phi_num = this.DH[1].d + this.DH[3].d + this.DH[2].d;

        for (let i = 0; i < 8; i++) {
            if (isNaN(theta[0][i])) continue;
            const s1 = Math.sin(theta[0][i]);
            const c1 = Math.cos(theta[0][i]);
            const t5_val = (T[12] * s1 - T[13] * c1 - phi_num) / d6;
            const th5 = Math.acos(Math.max(-1, Math.min(1, t5_val)));
            theta[4][i] = (i % 4 < 2) ? th5 : -th5;
        }
    }

    _calculateTheta6(targetMatrix, theta) {
        const targetInverse = new THREE.Matrix4().copy(targetMatrix).invert();
        const Ti = targetInverse.elements;

        for (let i = 0; i < 8; i++) {
            if (isNaN(theta[0][i]) || isNaN(theta[4][i])) continue;
            const s1 = Math.sin(theta[0][i]);
            const c1 = Math.cos(theta[0][i]);
            const s5 = Math.sin(theta[4][i]);

            // Avoid division by zero
            if (Math.abs(s5) < 1e-6) {
                theta[5][i] = 0; // Or handle as a special case (gimbal lock)
                continue;
            }
            const s6_num = -Ti[4] * s1 + Ti[5] * c1;
            const c6_num = Ti[0] * s1 - Ti[1] * c1;
            theta[5][i] = Math.atan2(s6_num / s5, c6_num / s5);
        }
    }

    _calculateTheta234(targetMatrix, theta) {
        const d4 = this.DH[3].d;
        const a2 = this.DH[1].a;
        const a3 = this.DH[2].a;

        for (let i = 0; i < 8; i++) {
            if (isNaN(theta[0][i]) || isNaN(theta[4][i]) || isNaN(theta[5][i])) continue;

            const tempThetas = [theta[0][i], 0, 0, 0, theta[4][i], theta[5][i]];

            const T01 = this.computeTransformMatrix(0, tempThetas);
            const T45 = this.computeTransformMatrix(4, tempThetas);
            const T56 = this.computeTransformMatrix(5, tempThetas);

            const T16 = new THREE.Matrix4().multiplyMatrices(T45, T56);
            const T14 = new THREE.Matrix4().copy(T01).invert().multiply(targetMatrix).multiply(T16.invert());

            // --- Theta3 ---
            const P13 = new THREE.Vector4(0, -d4, 0, 1).applyMatrix4(T14);
            const t3_val = (P13.x**2 + P13.y**2 - a2**2 - a3**2) / (2 * a2 * a3);
            const th3 = Math.acos(Math.max(-1, Math.min(1, t3_val)));
            theta[2][i] = (i % 2 === 0) ? th3 : -th3;

            // --- Theta2 ---
            const P13_norm = Math.sqrt(P13.x**2 + P13.y**2);
            const s2_num = -a3 * Math.sin(theta[2][i]);
            const s2_den = P13_norm;
            const th2_term2 = Math.asin(Math.max(-1, Math.min(1, s2_num / s2_den)));
            theta[1][i] = Math.atan2(-P13.y, -P13.x) - th2_term2;

            // --- Theta4 ---
            const T13 = new THREE.Matrix4();
            const T_2 = this.computeTransformMatrix(1, [0, theta[1][i]]);
            const T_3 = this.computeTransformMatrix(2, [0, 0, theta[2][i]]);
            T13.multiplyMatrices(T_2, T_3);
            const T34 = new THREE.Matrix4().copy(T13).invert().multiply(T14);
            theta[3][i] = Math.atan2(T34.elements[1], T34.elements[0]);
        }
    }
}

export default IK_toolkit;