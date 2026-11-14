<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions\Dao;

use Exception;

/**
 * Validates and normalises raw database results. The DB layer returns untyped
 * rows with numeric columns as strings; these helpers turn them into the typed
 * shapes the DAOs promise.
 */
final class Rows {
    /**
     * @param mixed $result Result of Db::fetchAll()
     *
     * @return list<array<mixed>>
     */
    public static function list($result): array {
        if (!is_array($result)) {
            return [];
        }

        $rows = [];
        foreach ($result as $row) {
            if (!is_array($row)) {
                throw new Exception('Unexpected database row format');
            }
            $rows[] = $row;
        }

        return $rows;
    }

    /**
     * @param mixed $result Result of Db::fetchRow()
     *
     * @return ?array<mixed>
     */
    public static function row($result): ?array {
        return is_array($result) && $result ? $result : null;
    }

    /**
     * @param array<mixed> $row
     */
    public static function int(array $row, string $column): int {
        $value = $row[$column] ?? null;
        if (!is_numeric($value)) {
            throw new Exception(sprintf('Unexpected value in database column "%s"', $column));
        }

        return (int) $value;
    }

    /**
     * @param array<mixed> $row
     */
    public static function string(array $row, string $column): string {
        $value = $row[$column] ?? null;
        if (!is_string($value)) {
            throw new Exception(sprintf('Unexpected value in database column "%s"', $column));
        }

        return $value;
    }
}
