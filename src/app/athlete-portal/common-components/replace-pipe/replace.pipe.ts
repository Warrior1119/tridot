import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'replace' })
export class ReplacePipe implements PipeTransform {

    transform(value: string, pattern: string|RegExp, replacement: string) {
        if (!value || !pattern) {
            return value;
        }
        const regexp = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        return value.replace(regexp, replacement);
    }

}