import {Container} from 'inversify';
import {IToolParameters} from '@tamasmagedli/urbanjs-tools-core';

export const TYPE_TOOL_SERVICE = Symbol('TYPE_TOOL_SERVICE');
export const TYPE_CONFIG_TOOL_PREFIX = Symbol('TYPE_CONFIG_TOOL_PREFIX');

export interface IToolService {
  initializeTool<T extends IToolParameters>(container: Container,
                                            toolName: string,
                                            taskName: string,
                                            parameters: T): void;
}
