import * as THREE from 'three';

class IK_toolkit {
    constructor() {
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
        jointIndex--;

        const rotationZ = new THREE.Matrix4().makeRotationZ(jointAngles[0][jointIndex]);
        const translationZ = new THREE.Matrix4().makeTranslation(0, 0, this.DH_matrix_UR16e[jointIndex][2]);
        const translationX = new THREE.Matrix4().makeTranslation(this.DH_matrix_UR16e[jointIndex][0], 0, 0);
        const rotationX = new THREE.Matrix4().makeRotationX(this.DH_matrix_UR16e[jointIndex][1]);

        const result = new THREE.Matrix4();
        result.multiplyMatrices(rotationZ, translationZ);
        result.multiply(translationX);
        result.multiply(rotationX);
        return result;
    }

    inverseKinematicSolutions(transform_matrix_unity) {
        const theta = Array(6).fill(0).map(() => Array(8).fill(0));
        const P05 = new THREE.Vector4(0, 0, -this.DH_matrix_UR16e[5][2], 1).applyMatrix4(transform_matrix_unity);

        const d_sum = this.DH_matrix_UR16e[1][2] + this.DH_matrix_UR16e[3][2] + this.DH_matrix_UR16e[2][2];
        const psi = Math.atan2(P05.y, P05.x);
        const phi = Math.acos(d_sum / Math.sqrt(P05.x ** 2 + P05.y ** 2));

        for (let i = 0; i < 4; i++) {
            theta[0][i] = psi + phi + Math.PI / 2;
            theta[0][i + 4] = psi - phi + Math.PI / 2;
        }

        for (let i = 0; i < 8; i += 4) {
            let t5 = (transform_matrix_unity.elements[12] * Math.sin(theta[0][i]) - transform_matrix_unity.elements[13] * Math.cos(theta[0][i]) - d_sum) / this.DH_matrix_UR16e[5][2];
            let th5 = (t5 >= -1 && t5 <= 1) ? Math.acos(t5) : 0;

            if (i === 0) {
                theta[4][0] = th5;
                theta[4][1] = th5;
                theta[4][2] = -th5;
                theta[4][3] = -th5;
            } else {
                theta[4][4] = th5;
                theta[4][5] = th5;
                theta[4][6] = -th5;
                theta[4][7] = -th5;
            }
        }

        const tmu_inverse = new THREE.Matrix4().copy(transform_matrix_unity).invert();
        const angles = [0, 2, 4, 6].map(i => Math.atan2(
            -tmu_inverse.elements[1] * Math.sin(theta[0][i]) + tmu_inverse.elements[5] * Math.cos(theta[0][i]),
            tmu_inverse.elements[0] * Math.sin(theta[0][i]) - tmu_inverse.elements[4] * Math.cos(theta[0][i])
        ));

        [0, 1].forEach(j => theta[5][j] = angles[0]);
        [2, 3].forEach(j => theta[5][j] = angles[1]);
        [4, 5].forEach(j => theta[5][j] = angles[2]);
        [6, 7].forEach(j => theta[5][j] = angles[3]);

        for (let i = 0; i <= 7; i += 2) {
            const t1 = [theta.map(row => row[i])];
            const T01 = this.computeTransformMatrix(1, t1);
            const T45 = this.computeTransformMatrix(5, t1);
            const T56 = this.computeTransformMatrix(6, t1);

            const T45_T56 = new THREE.Matrix4().multiplyMatrices(T45, T56);
            const T14 = new THREE.Matrix4().copy(T01).invert().multiply(transform_matrix_unity).multiply(new THREE.Matrix4().copy(T45_T56).invert());
            const P13 = new THREE.Vector4(0, -this.DH_matrix_UR16e[3][2], 0, 1).applyMatrix4(T14);

            let t3 = (P13.x ** 2 + P13.y ** 2 - this.DH_matrix_UR16e[1][0] ** 2 - this.DH_matrix_UR16e[2][0] ** 2) / (2 * this.DH_matrix_UR16e[1][0] * this.DH_matrix_UR16e[2][0]);
            let th3 = (t3 >= -1 && t3 <= 1) ? Math.acos(t3) : 0;
            theta[2][i] = th3;
            theta[2][i + 1] = -th3;
        }

        for (let i = 0; i < 8; i++) {
            const t1 = [theta.map(row => row[i])];
            const T01 = this.computeTransformMatrix(1, t1);
            const T45 = this.computeTransformMatrix(5, t1);
            const T56 = this.computeTransformMatrix(6, t1);

            const T45_T56 = new THREE.Matrix4().multiplyMatrices(T45, T56);
            const T14 = new THREE.Matrix4().copy(T01).invert().multiply(transform_matrix_unity).multiply(new THREE.Matrix4().copy(T45_T56).invert());
            const P13 = new THREE.Vector4(0, -this.DH_matrix_UR16e[3][2], 0, 1).applyMatrix4(T14);

            theta[1][i] = Math.atan2(-P13.y, -P13.x) - Math.asin(-this.DH_matrix_UR16e[2][0] * Math.sin(theta[2][i]) / Math.sqrt(P13.x ** 2 + P13.y ** 2));

            const t2 = [theta.map(row => row[i])];
            const T32 = new THREE.Matrix4().copy(this.computeTransformMatrix(3, t2)).invert();
            const T21 = new THREE.Matrix4().copy(this.computeTransformMatrix(2, t2)).invert();
            const T34 = new THREE.Matrix4().copy(T32).multiply(T21).multiply(T14);
            theta[3][i] = Math.atan2(T34.elements[1], T34.elements[0]);
        }
        return theta;
    }
}

export default IK_toolkit;