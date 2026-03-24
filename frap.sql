-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-01-2026 a las 22:32:11
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `frap`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admin`
--

CREATE TABLE `admin` (
  `id_admin` int(11) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contraseña` varchar(100) NOT NULL,
  `correo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alergia`
--

CREATE TABLE `alergia` (
  `id_Alergia` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `anatomica`
--

CREATE TABLE `anatomica` (
  `id_Anatomica` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fotografias`
--

CREATE TABLE `fotografias` (
  `id_Fotografia` int(11) NOT NULL,
  `reporte_id` int(11) NOT NULL,
  `foto` blob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumo`
--

CREATE TABLE `insumo` (
  `id_Insumo` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `cantidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lesion`
--

CREATE TABLE `lesion` (
  `id_Lesion` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lugar`
--

CREATE TABLE `lugar` (
  `id_Lugar` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicamento`
--

CREATE TABLE `medicamento` (
  `id_Medicamento` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `nivel_conciencia`
--

CREATE TABLE `nivel_conciencia` (
  `id_NivelConciencia` int(11) NOT NULL,
  `motora` int(11) NOT NULL,
  `verbal` int(11) NOT NULL,
  `ocular` int(11) NOT NULL,
  `total` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente`
--

CREATE TABLE `paciente` (
  `id_Paciente` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `edad` int(11) NOT NULL,
  `genero` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente_alergia`
--

CREATE TABLE `paciente_alergia` (
  `paciente_id` int(11) NOT NULL,
  `alergia_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente_medicamento`
--

CREATE TABLE `paciente_medicamento` (
  `paciente_id` int(11) NOT NULL,
  `medicamento_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente_patologia`
--

CREATE TABLE `paciente_patologia` (
  `paciente_id` int(11) NOT NULL,
  `patologia_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paramedico`
--

CREATE TABLE `paramedico` (
  `id_paramedico` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correoInst` varchar(100) NOT NULL,
  `correoEsc` varchar(100) NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `contraseña` varchar(100) NOT NULL,
  `firma_paramedico` blob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `patologia`
--

CREATE TABLE `patologia` (
  `id_Patologia` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pupilas`
--

CREATE TABLE `pupilas` (
  `id_Pupilas` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reporte`
--

CREATE TABLE `reporte` (
  `id_Reporte` int(11) NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `observaciones` text DEFAULT NULL,
  `recomendaciones` text DEFAULT NULL,
  `traslado_aceptado` tinyint(1) NOT NULL,
  `numero_unidad` varchar(100) DEFAULT NULL,
  `nombre_operador` varchar(100) DEFAULT NULL,
  `firma_operador` blob DEFAULT NULL,
  `firma_paciente` blob NOT NULL,
  `nombre_testigo` varchar(100) DEFAULT NULL,
  `firma_testigo` blob DEFAULT NULL,
  `lugar_id` int(11) NOT NULL,
  `signos_id` int(11) NOT NULL,
  `nivel_conciencia_id` int(11) NOT NULL,
  `paciente_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reporte_anatomica`
--

CREATE TABLE `reporte_anatomica` (
  `reporte_id` int(11) NOT NULL,
  `anatomica_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reporte_insumo`
--

CREATE TABLE `reporte_insumo` (
  `reporte_id` int(11) NOT NULL,
  `insumo_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reporte_lesion`
--

CREATE TABLE `reporte_lesion` (
  `reporte_id` int(11) NOT NULL,
  `lesion_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reporte_pupilas`
--

CREATE TABLE `reporte_pupilas` (
  `reporte_id` int(11) NOT NULL,
  `pupilas_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `signos_vitales`
--

CREATE TABLE `signos_vitales` (
  `id_Signos` int(11) NOT NULL,
  `Temp` int(11) NOT NULL,
  `FC` int(11) NOT NULL,
  `FR` int(11) NOT NULL,
  `SpO2` int(11) NOT NULL,
  `T_A` varchar(100) NOT NULL,
  `GLU` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id_admin`);

--
-- Indices de la tabla `alergia`
--
ALTER TABLE `alergia`
  ADD PRIMARY KEY (`id_Alergia`);

--
-- Indices de la tabla `anatomica`
--
ALTER TABLE `anatomica`
  ADD PRIMARY KEY (`id_Anatomica`);

--
-- Indices de la tabla `fotografias`
--
ALTER TABLE `fotografias`
  ADD PRIMARY KEY (`id_Fotografia`),
  ADD KEY `foto_reporte` (`reporte_id`);

--
-- Indices de la tabla `insumo`
--
ALTER TABLE `insumo`
  ADD PRIMARY KEY (`id_Insumo`);

--
-- Indices de la tabla `lesion`
--
ALTER TABLE `lesion`
  ADD PRIMARY KEY (`id_Lesion`);

--
-- Indices de la tabla `lugar`
--
ALTER TABLE `lugar`
  ADD PRIMARY KEY (`id_Lugar`);

--
-- Indices de la tabla `medicamento`
--
ALTER TABLE `medicamento`
  ADD PRIMARY KEY (`id_Medicamento`);

--
-- Indices de la tabla `nivel_conciencia`
--
ALTER TABLE `nivel_conciencia`
  ADD PRIMARY KEY (`id_NivelConciencia`);

--
-- Indices de la tabla `paciente`
--
ALTER TABLE `paciente`
  ADD PRIMARY KEY (`id_Paciente`);

--
-- Indices de la tabla `paciente_alergia`
--
ALTER TABLE `paciente_alergia`
  ADD PRIMARY KEY (`paciente_id`,`alergia_id`),
  ADD KEY `paciente_alergia_1` (`alergia_id`);

--
-- Indices de la tabla `paciente_medicamento`
--
ALTER TABLE `paciente_medicamento`
  ADD PRIMARY KEY (`paciente_id`,`medicamento_id`),
  ADD KEY `paciente_medicamento_1` (`medicamento_id`);

--
-- Indices de la tabla `paciente_patologia`
--
ALTER TABLE `paciente_patologia`
  ADD PRIMARY KEY (`paciente_id`,`patologia_id`),
  ADD KEY `paciente_patologia_1` (`patologia_id`);

--
-- Indices de la tabla `paramedico`
--
ALTER TABLE `paramedico`
  ADD PRIMARY KEY (`id_paramedico`);

--
-- Indices de la tabla `patologia`
--
ALTER TABLE `patologia`
  ADD PRIMARY KEY (`id_Patologia`);

--
-- Indices de la tabla `pupilas`
--
ALTER TABLE `pupilas`
  ADD PRIMARY KEY (`id_Pupilas`);

--
-- Indices de la tabla `reporte`
--
ALTER TABLE `reporte`
  ADD PRIMARY KEY (`id_Reporte`),
  ADD KEY `reporte_lugar` (`lugar_id`),
  ADD KEY `reporte_signos` (`signos_id`),
  ADD KEY `reporte_conciencia` (`nivel_conciencia_id`),
  ADD KEY `reporte_paciente` (`paciente_id`);

--
-- Indices de la tabla `reporte_anatomica`
--
ALTER TABLE `reporte_anatomica`
  ADD PRIMARY KEY (`reporte_id`,`anatomica_id`),
  ADD KEY `anatomica_id` (`anatomica_id`);

--
-- Indices de la tabla `reporte_insumo`
--
ALTER TABLE `reporte_insumo`
  ADD PRIMARY KEY (`reporte_id`,`insumo_id`),
  ADD KEY `insumo_id` (`insumo_id`);

--
-- Indices de la tabla `reporte_lesion`
--
ALTER TABLE `reporte_lesion`
  ADD PRIMARY KEY (`reporte_id`,`lesion_id`),
  ADD KEY `lesion_id` (`lesion_id`);

--
-- Indices de la tabla `reporte_pupilas`
--
ALTER TABLE `reporte_pupilas`
  ADD PRIMARY KEY (`reporte_id`,`pupilas_id`),
  ADD KEY `pupilas_id` (`pupilas_id`);

--
-- Indices de la tabla `signos_vitales`
--
ALTER TABLE `signos_vitales`
  ADD PRIMARY KEY (`id_Signos`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `admin`
--
ALTER TABLE `admin`
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `alergia`
--
ALTER TABLE `alergia`
  MODIFY `id_Alergia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `anatomica`
--
ALTER TABLE `anatomica`
  MODIFY `id_Anatomica` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `fotografias`
--
ALTER TABLE `fotografias`
  MODIFY `id_Fotografia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `insumo`
--
ALTER TABLE `insumo`
  MODIFY `id_Insumo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `lesion`
--
ALTER TABLE `lesion`
  MODIFY `id_Lesion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `lugar`
--
ALTER TABLE `lugar`
  MODIFY `id_Lugar` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `medicamento`
--
ALTER TABLE `medicamento`
  MODIFY `id_Medicamento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `nivel_conciencia`
--
ALTER TABLE `nivel_conciencia`
  MODIFY `id_NivelConciencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `paciente`
--
ALTER TABLE `paciente`
  MODIFY `id_Paciente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `paramedico`
--
ALTER TABLE `paramedico`
  MODIFY `id_paramedico` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `patologia`
--
ALTER TABLE `patologia`
  MODIFY `id_Patologia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `pupilas`
--
ALTER TABLE `pupilas`
  MODIFY `id_Pupilas` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `reporte`
--
ALTER TABLE `reporte`
  MODIFY `id_Reporte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `signos_vitales`
--
ALTER TABLE `signos_vitales`
  MODIFY `id_Signos` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `fotografias`
--
ALTER TABLE `fotografias`
  ADD CONSTRAINT `foto_reporte` FOREIGN KEY (`reporte_id`) REFERENCES `reporte` (`id_Reporte`);

--
-- Filtros para la tabla `paciente_alergia`
--
ALTER TABLE `paciente_alergia`
  ADD CONSTRAINT `paciente_alergia_1` FOREIGN KEY (`alergia_id`) REFERENCES `alergia` (`id_Alergia`),
  ADD CONSTRAINT `paciente_alergia_2` FOREIGN KEY (`paciente_id`) REFERENCES `paciente` (`id_Paciente`);

--
-- Filtros para la tabla `paciente_medicamento`
--
ALTER TABLE `paciente_medicamento`
  ADD CONSTRAINT `paciente_medicamento_1` FOREIGN KEY (`medicamento_id`) REFERENCES `medicamento` (`id_Medicamento`),
  ADD CONSTRAINT `paciente_medicamento_2` FOREIGN KEY (`paciente_id`) REFERENCES `paciente` (`id_Paciente`);

--
-- Filtros para la tabla `paciente_patologia`
--
ALTER TABLE `paciente_patologia`
  ADD CONSTRAINT `paciente_patologia_1` FOREIGN KEY (`patologia_id`) REFERENCES `patologia` (`id_Patologia`),
  ADD CONSTRAINT `paciente_patologia_2` FOREIGN KEY (`paciente_id`) REFERENCES `paciente` (`id_Paciente`);

--
-- Filtros para la tabla `reporte`
--
ALTER TABLE `reporte`
  ADD CONSTRAINT `reporte_conciencia` FOREIGN KEY (`nivel_conciencia_id`) REFERENCES `nivel_conciencia` (`id_NivelConciencia`),
  ADD CONSTRAINT `reporte_lugar` FOREIGN KEY (`lugar_id`) REFERENCES `lugar` (`id_Lugar`),
  ADD CONSTRAINT `reporte_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `paciente` (`id_Paciente`),
  ADD CONSTRAINT `reporte_signos` FOREIGN KEY (`signos_id`) REFERENCES `signos_vitales` (`id_Signos`);

--
-- Filtros para la tabla `reporte_anatomica`
--
ALTER TABLE `reporte_anatomica`
  ADD CONSTRAINT `reporte_anatomica_ibfk_1` FOREIGN KEY (`anatomica_id`) REFERENCES `anatomica` (`id_Anatomica`),
  ADD CONSTRAINT `reporte_anatomica_ibfk_2` FOREIGN KEY (`reporte_id`) REFERENCES `reporte` (`id_Reporte`);

--
-- Filtros para la tabla `reporte_insumo`
--
ALTER TABLE `reporte_insumo`
  ADD CONSTRAINT `reporte_insumo_ibfk_1` FOREIGN KEY (`insumo_id`) REFERENCES `insumo` (`id_Insumo`),
  ADD CONSTRAINT `reporte_insumo_ibfk_2` FOREIGN KEY (`reporte_id`) REFERENCES `reporte` (`id_Reporte`);

--
-- Filtros para la tabla `reporte_lesion`
--
ALTER TABLE `reporte_lesion`
  ADD CONSTRAINT `reporte_lesion_ibfk_1` FOREIGN KEY (`lesion_id`) REFERENCES `lesion` (`id_Lesion`),
  ADD CONSTRAINT `reporte_lesion_ibfk_2` FOREIGN KEY (`reporte_id`) REFERENCES `reporte` (`id_Reporte`);

--
-- Filtros para la tabla `reporte_pupilas`
--
ALTER TABLE `reporte_pupilas`
  ADD CONSTRAINT `reporte_pupilas_ibfk_1` FOREIGN KEY (`pupilas_id`) REFERENCES `pupilas` (`id_Pupilas`),
  ADD CONSTRAINT `reporte_pupilas_ibfk_2` FOREIGN KEY (`reporte_id`) REFERENCES `reporte` (`id_Reporte`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
