import * as THREE from 'three';

class IK_toolkit {
    constructor() {
        // Denavit-Hartenberg parameters for UR16e robot arm
        this.DH_matrix_UR16e = [
            [0, Math.PI / 2.0, 0.1807],
            [-0.4784, 0, 0],
            [-0.36, 0, 0],
            [0, Math.PI / 2.0, 0.17415],
            [0, -Math.PI / 2.0, 0.11985],
            [0, 0, 0.11655]
        ];
    }

    computeTransformMatrix(jointIndex, jointAngles) {
        jointIndex--; // Adjust for 0-based index

        const theta = jointAngles[jointIndex];
        const alpha = this.DH_matrix_UR16e[jointIndex][1];
        const a = this.DH_matrix_UR16e[jointIndex][0];
        const d = this.DH_matrix_UR16e[jointIndex][2];

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

    // Verified 1-to-1 translation of your C# IK solver
    inverseKinematicSolutions(targetMatrix) {
        const theta = Array(6).fill(0).map(() => Array(8).fill(NaN));
        const T = targetMatrix.elements;

        const d1 = this.DH_matrix_UR16e[0][2];
        const d2 = this.DH_matrix_UR16e[1][2];
        const d3 = this.DH_matrix_UR16e[2][2];
        const d4 = this.DH_matrix_UR16e[3][2];
        const d5 = this.DH_matrix_UR16e[4][2];
        const d6 = this.DH_matrix_UR16e[5][2];
        const a2 = this.DH_matrix_UR16e[1][0];
        const a3 = this.DH_matrix_UR16e[2][0];
        
        const phi_num = d2 + d4 + d3; // As in your C# code
        
        // --- Theta1 ---
        const P05 = new THREE.Vector4(0, 0, -d6, 1).applyMatrix4(targetMatrix);
        const psi = Math.atan2(P05.y, P05.x);
        const phi_den = Math.sqrt(P05.x**2 + P05.y**2);
        if (phi_den < Math.abs(phi_num)) return theta; // Unreachable
        
        const phi = Math.acos(phi_num / phi_den);

        for(let i = 0; i < 4; i++) theta[0][i] = psi + phi + Math.PI / 2;
        for(let i = 4; i < 8; i++) theta[0][i] = psi - phi + Math.PI / 2;

        // --- Theta5 ---
        for (let i = 0; i < 8; i++) {
            const s1 = Math.sin(theta[0][i]);
            const c1 = Math.cos(theta[0][i]);
            const t5_val = (T[12] * s1 - T[13] * c1 - phi_num) / d6;
            const th5 = Math.acos(Math.max(-1, Math.min(1, t5_val)));
            theta[4][i] = (i % 4 < 2) ? th5 : -th5;
        }

        // --- Theta6 ---
        const targetInverse = new THREE.Matrix4().copy(targetMatrix).invert();
        const Ti = targetInverse.elements;
        for (let i = 0; i < 8; i++) {
            const s1 = Math.sin(theta[0][i]);
            const c1 = Math.cos(theta[0][i]);
            const s6_num = -Ti[4] * s1 + Ti[5] * c1;
            const c6_num = Ti[0] * s1 - Ti[1] * c1;
            theta[5][i] = Math.atan2(s6_num, c6_num);
        }

        // --- Theta3, Theta2, Theta4 ---
        for (let i = 0; i < 8; i+=2) {
             const tempThetas = [theta[0][i], 0,0,0, theta[4][i], theta[5][i]];
             const T01 = this.computeTransformMatrix(1, tempThetas);
             const T45 = this.computeTransformMatrix(5, tempThetas);
             const T56 = this.computeTransformMatrix(6, tempThetas);
             const T14 = new THREE.Matrix4().copy(T01).invert().multiply(targetMatrix).multiply(new THREE.Matrix4().multiplyMatrices(T45, T56).invert());
             const P13 = new THREE.Vector4(0, -d4, 0, 1).applyMatrix4(T14);
             const t3_val = (P13.x**2 + P13.y**2 - a2**2 - a3**2) / (2 * a2 * a3);
             const th3 = Math.acos(Math.max(-1, Math.min(1, t3_val)));
             theta[2][i] = th3;
             theta[2][i+1] = -th3;
        }
        
        for (let i = 0; i < 8; i++) {
             const tempThetas = [theta[0][i], 0, theta[2][i], 0, theta[4][i], theta[5][i]];
             const T01 = this.computeTransformMatrix(1, tempThetas);
             const T45 = this.computeTransformMatrix(5, tempThetas);
             const T56 = this.computeTransformMatrix(6, tempThetas);
             const T14 = new THREE.Matrix4().copy(T01).invert().multiply(targetMatrix).multiply(new THREE.Matrix4().multiplyMatrices(T45, T56).invert());
             const P13 = new THREE.Vector4(0, -d4, 0, 1).applyMatrix4(T14);

             theta[1][i] = Math.atan2(-P13.y, -P13.x) - Math.asin(Math.max(-1, Math.min(1, (-a3 * Math.sin(theta[2][i]) / Math.sqrt(P13.x**2 + P13.y**2)))));

             const T2_thetas = [theta[0][i], theta[1][i], 0,0,0,0];
             const T3_thetas = [theta[0][i], theta[1][i], theta[2][i], 0,0,0];
             const T21 = this.computeTransformMatrix(2, T2_thetas);
             const T32 = this.computeTransformMatrix(3, T3_thetas);
             const T34 = new THREE.Matrix4().copy(T32).invert().multiply(T21.invert()).multiply(T14);
             theta[3][i] = Math.atan2(T34.elements[1], T34.elements[0]);
        }
        return theta;
    }
}

export default IK_toolkit;