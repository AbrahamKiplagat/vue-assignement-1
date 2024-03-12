<?php

namespace App\Filament\Admin\Resources\UsersclsResource\Pages;

use App\Filament\Admin\Resources\UsersclsResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditUserscls extends EditRecord
{
    protected static string $resource = UsersclsResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
